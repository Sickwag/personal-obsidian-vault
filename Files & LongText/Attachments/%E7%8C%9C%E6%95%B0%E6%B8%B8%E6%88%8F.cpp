#include <stdio.h>
#include <time.h>
#include <stdlib.h>
int main()
{
	srand(time(0));
	int number = rand()%100+1,input,count=1;
	scanf("%d",&input);
	do{
		if(input>number)
		{
		printf("your input is too big !");
		}
		else if(input<number)
		{
		printf("your input is too small !");
		}
		scanf("%d",&input);
		count++;
	}while(input!=number);
	printf("you re right ! you ve guessed %d times !",count);
return 0;
}