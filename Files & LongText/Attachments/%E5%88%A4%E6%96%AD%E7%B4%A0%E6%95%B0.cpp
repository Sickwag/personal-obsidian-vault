#include <stdio.h>
int main(){
	int test_num=2,input=0,test=0;
	scanf("%d",&input);
	for(test_num=2;test_num!=input;test_num++){
		if(input % test_num ==0){
			printf("your num is not qualified .");
			break;
		}
	}
	if(input==test_num){
		printf("your num is qualified.");
	}
	return 0;
}