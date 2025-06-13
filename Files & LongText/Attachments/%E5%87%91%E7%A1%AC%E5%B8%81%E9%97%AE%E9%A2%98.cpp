#include <stdio.h>
int main()
{
	    int x,one,two,five,exit;
	    printf("please input your money : ");
	    scanf("%d",&x);
	    for(one = 1;one<x*10;one++){
	    	for(two = 1;two<x*10/2;two++){
	    		for(five=1;five<x*10/5;five++){
	    			if(one + two*2 + five *5 == x*10){
						printf("you can fulfill this with %d 1 pennis , %d 2 pennis and %d 5pennis .\n",one,two,five);
						exit = 1;
						break;
					}
				}
				if (exit==1)break;
			}
			if(exit==1)break;
		}
    return 0;
}