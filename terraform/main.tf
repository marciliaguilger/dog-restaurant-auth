provider "aws" {
       region = "us-east-1"
     }

     resource "aws_iam_role" "lambda_role" {
       name = "lambda_role"

       assume_role_policy = jsonencode({
         Version = "2012-10-17"
         Statement = [
           {
             Action = "sts:AssumeRole"
             Effect = "Allow"
             Sid    = ""
             Principal = {
               Service = "lambda.amazonaws.com"
             }
           },
         ]
       })
     }

     resource "aws_iam_role_policy_attachment" "lambda_policy" {
       role       = aws_iam_role.lambda_role.name
       policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
     }

     resource "aws_lambda_function" "example" {
       function_name = "example_lambda"
       role          = aws_iam_role.lambda_role.arn
       handler       = "index.handler"
       runtime       = "nodejs14.x"

       filename      = "lambda_function_payload.zip"
       source_code_hash = filebase64sha256("lambda_function_payload.zip")

       environment {
         variables = {
           foo = "bar"
         }
       }
     }