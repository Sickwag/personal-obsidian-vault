#include <stdio.h>
int main(){
	int input=0,sum=1,start=0;
	scanf("%d",&input);
	for(start=input;start>0;start--){
		sum=sum*start;
	}
	printf("the sum is %d",sum);
	return 0;
}