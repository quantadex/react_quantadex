cp -r ../public www/
cordova build android
cordova build android --release -- --keystore=./quanta.key --storePassword=Quanta123 --alias=key0 --password=Quanta123
