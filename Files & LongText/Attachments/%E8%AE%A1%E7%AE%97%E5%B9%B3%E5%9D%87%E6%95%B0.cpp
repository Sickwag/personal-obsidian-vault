#include <stdio.h>
int main()
{
	int input = 0,sum=0,count=0;
	double average=0;
	while(input!=-1)
	{
	scanf("%d",&input);
	if(input==-1)
		{
			break;
		}
	sum+=input;
	count ++;
	}
	average = (double)sum/count;
	printf("average = %.2f",average);
return 0;
}