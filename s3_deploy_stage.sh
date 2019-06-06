aws s3 sync --acl public-read public s3://stage.quantadex.com/public
aws s3 cp --acl public-read public/index.html  s3://stage.quantadex.com/
aws s3 sync --acl public-read public/favicon s3://stage.quantadex.com/assets/favicon
aws cloudfront create-invalidation --distribution-id 	E2N195P6QGC5KA --paths "/*"