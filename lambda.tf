module "lambda_function" {
  source = "terraform-aws-modules/lambda/aws"
  function_name = "my-lambda"
  description   = "My awesome lambda function"
  handler       = "index.lambda_handler"
  runtime       = "python3.8"
  source_path = "../src/lambda-function"
  tags = {
    Name = "my-lambda"
  }
}