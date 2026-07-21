# Pooling Components -- Universal Connection Pool

## Architecture Overview

### Facade + State Pattern

connection_pool<T> is a thin facade (~50 lines). All logic lives in pool_state<T>.

```
connection_pool<T>          pool_state<T>
   (facade)                    (engine)

   borrow()               ->  borrow()
   try_borrow()           ->  try_borrow()
   borrow_async()         ->  borrow_async()
   close()                ->  close()
   stats()                ->  snapshot()
```

Benefit: connection_pool is a lightweight movable handle.
Multiple pools can share one pool_state via shared_ptr.

### borrowed_connection RAII Design

Three core members:

- shared_ptr<pool_state<T>> state_        -- pointer to pool
- shared_ptr<connection_record<T>> record_ -- pointer to connection record
- uint64_t lease_generation_              -- version stamp, validates handle validity

On destroy (RAII):
1. Lock mutex
2. Check lease_generation matches current
3. Decide: reuse/close/quarantine based on protocol state
4. Push to idle_ or close
5. Notify one waiter (cv_.notify_one)

### Three Borrow Methods

- borrow() -- blocking until success
- try_borrow() -- non-blocking, returns nullopt on failure
- borrow_for(timeout) -- waits up to timeout, returns nullopt on timeout

### Why optional<borrowed_connection<T>>?

try_borrow and borrow_for can "not get a connection".
optional handles this uniformly.

### connection_record<T> -- the metadata wrapper

Every T instance is wrapped in connection_record<T>:

Fields:
- id (uint64_t) -- unique per connection
- connection (T) -- the actual resource
- endpoint (endpoint_config) -- which endpoint this belongs to
- state (idle/active/checking/closing/broken/retired)
- created_at, last_used_at, borrowed_at -- timestamps
- reuse_count -- how many times borrowed
- lease_generation -- version stamp for handle validation
- active_streams -- for multiplexed connections
- credential_generation -- for credential rotation
- tags, tenant_id, affinity_key -- routing metadata



### lease_generation -- handle invalidation

When borrowed_connection is created from pool_state, the current lease_generation
of the connection_record is captured. On return, pool_state checks:
  - record->lease_generation == captured lease_generation_?
If not equal, the handle is stale (connection was already returned or invalidated).

This prevents double-return or use-after-return bugs.

### Performance: lock-created-unlock pattern

Borrow path has a key optimization:
1. LOCK: check invariants, decide to create
2. UNLOCK: call factory.create() (expensive, might take ms)
3. LOCK: finish creating, validate, push to idle

The expensive create() call happens OUTSIDE the lock.
This means other threads can borrow/return while create() is running.
The creating connection count is tracked to prevent overflow.

### Key Enum Groups

#### Pool Behavior (options.hpp)
- wait_policy: fifo / priority / fair -- how to queue when full
- overload_policy: timeout / fail_fast / block / custom -- what to do when saturated
- overload_action: reject / enqueue / shed_low_priority / create_if_allowed
- purge_policy: lazy / eager / manual -- when to evict stale connections
- validation_policy: never / on_borrow / on_return / background
- shutdown_policy: graceful / force
- close_timeout_policy: wait_for_background / detach / fallback_sync

#### Routing (endpoint.hpp)
- routing_policy: single / round_robin / weighted / read_write_split / consistent_hash / latency_aware
- endpoint_role: any / read / write
- borrow_intent: any / read / write
- fallback_mode: fail_fast / same_group / same_region / any_healthy

#### Connection State Machine
- connection_state: idle -> active -> checking -> closing -> broken -> retired
- resource_cleanliness: clean / dirty_resettable / dirty_unresettable / pinned / quarantined
- return_policy: reuse / reset_then_reuse / close / quarantine

#### Multi-tenancy
- priority_class: low / normal / high / critical
- quota_overflow_policy: reject / queue / borrow_from_shared / shed_low_priority

#### Observability
- stats_mode: disabled / counters_only / full

### No External Dependencies -- the trade-off

Standard library covers: threads (mutex/cv), coroutines (future/promise),
containers, chrono, atomic, optional/variant.

Missing (all hand-written):
- JSON serialization: stats.cpp (~386 lines of string concatenation)
- Prometheus format: stats.cpp (~100 lines)
- C ABI wrapper: c_api.cpp (~1776 lines, exception boundaries)
- Format helpers: detail/format.hpp
- Option validation: connection_pool.cpp (~869 lines of if-else checks)

With nlohmann/json or fmtlib, stats.cpp and c_api.cpp could be ~50% shorter.

### Call Flow

borrow() complete path:

[Caller] --borrow()--> [pool_state]
  1. lock mutex_
  2. check not closed
  3. try idle_ fast path:
     - select endpoint via router
     - pop from idle_by_endpoint_[ep]
     - validate (lease_generation, health)
  4. if idle miss:
     - if can create (total < max_size): unlock -> create -> lock -> finish
     - if full: enqueue waiter -> cv.wait_for(timeout)
  5. if success: return borrowed_connection (RAII)
  6. if timeout: return nullopt

return() path (~borrowed_connection):
  1. lock mutex_
  2. check lease_generation matches
  3. check protocol state (clean/dirty)
  4. reuse -> push to idle_by_endpoint_
     close -> call factory.close()
     quarantine -> mark and close
  5. notify_one on cv_
  6. unlock

reaper thread cycle (every reaper_interval, default 10s):
  1. idle eviction: last_used_at + idle_timeout < now
  2. max lifetime: created_at + max_lifetime < now
  3. max reuse: reuse_count >= max_reuse_count
  4. leak detection: borrowed too long without return
  5. health check: verify idle connections
  6. credential expiry: drain connections with expired credentials

