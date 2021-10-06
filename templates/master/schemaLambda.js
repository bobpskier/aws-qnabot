const util = require('../util');

module.exports={
    "SchemaLambdaCodeVersion":{
        "Type": "Custom::S3Version",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["CFNLambda", "Arn"] },
            "Bucket": {"Ref":"BootstrapBucket"},
            "Key": {"Fn::Sub":"${BootstrapPrefix}/lambda/schema.zip"},
            "BuildDate":(new Date()).toISOString()
        }
    },
    "SchemaLambda": {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "S3Bucket": {"Ref":"BootstrapBucket"},
            "S3Key": {"Fn::Sub":"${BootstrapPrefix}/lambda/schema.zip"},
            "S3ObjectVersion":{"Ref":"SchemaLambdaCodeVersion"}
        },
        Environment: {
          Variables: {
            DEFAULT_SETTINGS_PARAM: {Ref: "DefaultQnABotSettings"},
            CUSTOM_SETTINGS_PARAM: {Ref: "CustomQnABotSettings"}
          }
        },
        "Handler": "index.handler",
        "MemorySize": "128",
        "Role": {"Fn::GetAtt": ["SchemaLambdaRole","Arn"]},
        "Runtime": "nodejs12.x",
        "Timeout": 300,
        "VpcConfig" : {
            "Fn::If": [ "VPCEnabled", {
                "SubnetIds": {"Ref": "VPCSubnetIdList"},
                "SecurityGroupIds": {"Ref": "VPCSecurityGroupIdList"}
            }, {"Ref" : "AWS::NoValue"} ]
        },
        "TracingConfig" : {
            "Fn::If": [ "XRAYEnabled", {"Mode": "Active"},
                {"Ref" : "AWS::NoValue"} ]
        },
        "Tags":[{
            Key:"Type",
            Value:"Api"
        }]
      },
      "Metadata": util.cfnNag(["W92"])
      
    },
    SchemaLambdaPolicy: {
      Type: "AWS::IAM::ManagedPolicy",
      Properties: {
        PolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: [
                "ssm:GetParameter",
              ],
              Resource: [
                {"Fn::Join": ["", ["arn:aws:ssm:", {"Ref": "AWS::Region"}, ":", {"Ref": "AWS::AccountId"}, ":parameter/", {"Ref": "CustomQnABotSettings"}]]},
                {"Fn::Join": ["", ["arn:aws:ssm:", {"Ref": "AWS::Region"}, ":", {"Ref": "AWS::AccountId"}, ":parameter/", {"Ref": "DefaultQnABotSettings"}]]},
              ],
            },
          ],
        },
      },
    },
    "SchemaLambdaRole": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": "lambda.amazonaws.com"
              },
              "Action": "sts:AssumeRole"
            }
          ]
        },
        "Path": "/",
        "Policies": [
          util.basicLambdaExecutionPolicy(),
          util.lambdaVPCAccessExecutionRole(),
          util.xrayDaemonWriteAccess(),
        ],
        "ManagedPolicyArns": [
          {"Ref":"QueryPolicy"},
          {Ref:"SchemaLambdaPolicy"}

        ]
      },
      "Metadata": util.cfnNag(["W11", "W12"])
    }
}

