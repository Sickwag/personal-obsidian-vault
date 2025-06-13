#include <stdio.h>
int main(){
	int test_num=2,start=0;//从start=2开始遍历所有的数字是不是素数，test_num是用来素数测试的
	for(start=2;start<=100;start++){
		for(test_num=2;test_num!=start;test_num++){
			if(start % test_num ==0){
				break;
			}
		}
		if(start==test_num){
			printf("%d\n",test_num);
		}
	}
	return 0;
}