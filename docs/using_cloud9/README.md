# Using Amazon Cloud 9 to Deploy QnABot

QnABot can be installed via a properly configured [AWS Cloud 9](https://aws.amazon.com/cloud9/) instance.  The Cloud 9 instance requires at least 25GB of storage space.  The bash commands below will create a Cloud 9 environment in the default VPC.  

## Launching AWS CloudShell

The most straightforward method to run the commands below is via [AWS CloudShell](https://aws.amazon.com/cloudshell/)

Log into the AWS Console and click on the Cloudshell icon.

![CloudShell](./cloudshell.png)


## Creating the Cloud 9 environment

If you have made changes to your [default VPC settings](https://docs.aws.amazon.com/vpc/latest/userguide/default-vpc.html), deleted your default VPC or the script below does not work, please [see the requirements for Cloud 9](https://docs.aws.amazon.com/cloud9/latest/user-guide/vpc-settings.html).

```bash

#set this to the name of your environment
ENVIRONMENT_NAME=QNABOT

# Create the Cloud 9 instance
CLOUD9_ID=$(aws cloud9 create-environment-ec2 --name $ENVIRONMENT_NAME --description "QnABot build environment" --instance-type t2.medium  --automatic-stop-time-minutes 120  --owner-arn $(aws sts get-caller-identity | jq -r ".Arn")  | jq -r ".environmentId")

STACKNAME="aws-cloud9-$ENVIRONMENT_NAME-$CLOUD9_ID"

# Wait for the Cloud 9 instance to be created
CLOUD9_STATUS=""
while [[ $CLOUD9_STATUS != ready  &&  $CLOUD9_STATUS != error  ]]; do CLOUD9_STATUS=$(aws cloud9 describe-environment-status --environment-id $CLOUD9_ID | jq -r ".status");ECHO "WAITING...";sleep 10; done

#Check to make sure it was successfully created
#If status == error, Go to the CloudFormation page in the AWS console and find the stack printed below.

echo $CLOUD9_STATUS
echo $STACKNAME

```

## Increasing the storage of the volume attached to the AWS Cloud 9 instance.


The following set of bash commands will resize the volume attached to your Cloud 9 instance.  

### Setting the name of the CloudFormation variable

If you were able to run the bash commands above, the $STACKNAME will already be defined.  If you had to create the Cloud 9 environmnent manually, set the STACKNAME variable before running the commands below to increase the size of the volume. The name of the CloudFormation stack will start with "aws-cloud9"

```
STACKNAME=aws-cloud9....
```

### Resize the attached volume and reboot your instance.

```bash
# Cloud 9 by default creates an environment with 10GB of storage.  QnABot requires more. 

## Get the instance id of the EC2 instance used for Cloud 9

INSTANCE_ID=$(aws cloudformation describe-stack-resource  --stack-name $STACKNAME --logical-resource-id Instance | jq -r ".StackResourceDetail.PhysicalResourceId")

## Get the attached volume of the Cloud 9 instance


VOLUME_ID=$(aws ec2 describe-volumes --filters Name="attachment.instance-id",Values=$INSTANCE_ID | jq -r ".Volumes[0].VolumeId")

## Change the size of the volume to 25

aws ec2 modify-volume --size 25 --volume-id $VOLUME_ID

## Reboot the instance
aws ec2 reboot-instances --instance-ids $INSTANCE_ID 
```

## Install Node v12 and the latest version of npm

Log into your AWS Account and go to [AWS Cloud 9 Service home page](https://console.aws.amazon.com/cloud9/home#). Choose "Open IDE".


QnABot requires [Node v12](https://nodejs.org/en/about/releases/).  

Check to see which version of Node installed by typing ```node -v``` in the terminal.  If the version is not 12, type the folowing commands

```bash
sudo yum -y update
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash        
nvm install v12
```

And now install the latest version of [npm](https://www.npmjs.com/).

```
npm install latest-version
```