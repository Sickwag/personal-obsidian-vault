#include <stdio.h>
int main()
{
	int input=0,digital=0,sum=0;
	scanf("%d",&input);
	while (input>0){
	digital=input % 10;
	input=input / 10;
	sum=sum*10+digital;
	}
	printf("the num is %d",sum);
return 0;
}