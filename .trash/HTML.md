### 表格
#### 表格的简单样式
```html
<table border="1">
       <caption>table with 1 pound border</caption>
       <tr>
           <th>column 1</th>
           <th>column 2</th>
           <th>column 3</th>
       </tr>
       <tr>
           <td>(0,0)</td>
           <td>(0,1)</td>
           <td>(0,2)</td>
       </tr>
       <tr>
           <td>(1,0)</td>
           <td>(1,1)</td>
           <td>(1,2)</td>
       </tr>
       <tr>
           <td>(2,0)</td>
           <td>(2,1)</td>
           <td>(2,2)</td>
       </tr>
   </table>
   <br>
   <br>

   <!-- table with no pound border  -->
   <table border="0">
       <caption>table with no pound border</caption>
   <!-- or you can write no properties -->
       <tr>
           <th>column 1</th>
           <th>column 2</th>
           <th>column 3</th>
       </tr>
       <tr>
           <td>(0,0)</td>
           <td>(0,1)</td>
           <td>(0,2)</td>
       </tr>
       <tr>
           <td>(1,0)</td>
           <td>(1,1)</td>
           <td>(1,2)</td>
       </tr>
       <tr>
           <td>(2,0)</td>
           <td>(2,1)</td>
           <td>(2,2)</td>
       </tr>
   </table>
   <br>
   <br>

   <!-- create spanning cells with table_heading-->
   <table border="1">
       <caption>create spanning cells with table_heading</caption>
       <caption style="height: fit-content;width: auto;font: 500;color: blueviolet;">a colspan table</caption>
       <tr>
           <th colspan="3">column</th>
       </tr>
       <tr>
           <td>(0,0)</td>
           <td>(0,1)</td>
           <td>(0,2)</td>
       </tr>
       <tr>
           <td>(1,0)</td>
           <td>(1,1)</td>
           <td>(1,2)</td>
       </tr>
       <tr>
           <td>(2,0)</td>
           <td>(2,1)</td>
           <td>(2,2)</td>
       </tr>
   </table>
   <br>
   <br>

   <!-- this is table inside outside table -->
   <table border="1">
       <caption>this is table inside outside table</caption>
       <tr>
           <th>column 1</th>
           <th>column 2</th>
           <th>column 3</th>
       </tr>
       <tr>
           <td>
               <table border="1">
                   <tr>
                       <th>column 1</th>
                       <th>column 2</th>
                       <th>column 3</th>
                   </tr>
                   <tr>
                       <td>(0,0)</td>
                       <td>(0,1)</td>
                       <td>(0,2)</td>
                   </tr>
                   <tr>
                       <td>(1,0)</td>
                       <td>(1,1)</td>
                       <td>(1,2)</td>
                   </tr>
                   <tr>
                       <td>(2,0)</td>
                       <td>(2,1)</td>
                       <td>(2,2)</td>
                   </tr>
               </table>
           </td>
           <td>(0,1)</td>
           <td>(0,2)</td>
       </tr>
       <tr>
           <td>(1,0)</td>
           <td>(1,1)</td>
           <td>(1,2)</td>
       </tr>
       <tr>
           <td>(2,0)</td>
           <td>(2,1)</td>
           <td>(2,2)</td>
       </tr>
   </table>
```