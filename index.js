var  CryptoJS =  require("crypto-js");
var request = require("request");

const secretKey = "xxxx",
keyId="xxxx",
region="us-east-1";
     

let date = new Date(),
    currentT = getCurrentTime(date),
    currentYMD = getCurrentYMD(date);

// 1. Canonical Request
let canonicalRequest = "GET\n" +
    "/\n" +
    "Action=ListRoles&Version=2010-05-08\n" +
    "host:iam.amazonaws.com\n" +
    "x-amz-date:" + currentT + "\n" +
    "\n" +
    "host;x-amz-date\n" +
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

console.log("\n==== canonicalRequest:\n" + canonicalRequest);


// 2. Hash the Canonical Request
let hashedReq = CryptoJS.SHA256(canonicalRequest);
console.log("\n==== hased req:\n" + hashedReq);


// 3. String to sign
let stringToSign = "AWS4-HMAC-SHA256\n" +
    currentT + "\n" +
    currentYMD + "/" + region + "/iam/aws4_request\n" +
    hashedReq;
console.log("\n==== string to sign:\n" + stringToSign);


// 4. Calculate signature key
let signKey = getSignatureKey(secretKey, currentYMD, region, "iam");

// 5. Sign and convert to Hex
let signature = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(stringToSign, signKey));
console.log("\n==== signature:\n" + signature);


// 6. Final http header
let authorization = "AWS4-HMAC-SHA256 " + "Credential=" + keyId + "/" + currentYMD + "/" + region + "/iam/aws4_request, " + "SignedHeaders=host;x-amz-date, " + "Signature=" + signature;


// http request
let options = {
    url: "https://iam.amazonaws.com/?Action=ListRoles&Version=2010-05-08",
    method: "GET",
    headers: {
        "Host": "iam.amazonaws.com",
        "X-Amz-Date": currentT,
        "Authorization": authorization,
        "Accept": "application/json"
    }
};

request(options, (err, response, body) => {
    if (err) {
        console.log("eeeee:: " + err);
    } else {
        console.log("==>" + JSON.stringify(JSON.parse(body), null, 4));
    }
})



function getSignatureKey(key, dateStamp, regionName, serviceName) {
    var kDate = CryptoJS.HmacSHA256(dateStamp, "AWS4" + key);
    var kRegion = CryptoJS.HmacSHA256(regionName, kDate);
    var kService = CryptoJS.HmacSHA256(serviceName, kRegion);
    var kSigning = CryptoJS.HmacSHA256("aws4_request", kService);
    return kSigning;
}

function getCurrentTime(date) {
    // let date = new Date(),
    let monthN = date.getUTCMonth() + 1,
        dayN = date.getUTCDate(),
        hourN = date.getUTCHours(),
        minN = date.getUTCMinutes(),
        secN = date.getUTCSeconds(),
        month = monthN.toString(), day = dayN.toString(), hour = hourN.toString(), min = minN.toString(), sec = secN.toString();
    if (monthN < 10) {
        month = "0" + monthN.toString();
    }
    if (dayN < 10) {
        day = "0" + dayN.toString();
    }
    if (hourN < 10) {
        hour = "0" + hourN.toString();
    }
    if (minN < 10) {
        min = "0" + minN.toString();
    }
    if (secN < 10) {
        sec = "0" + secN.toString();
    }

    let currentYMD = date.getUTCFullYear().toString() + month + day;
    let currentT = currentYMD + "T" + hour + min + sec + "Z";

    console.log("==== current time format: " + currentT);

    return currentT
}

function getCurrentYMD(date) {
    let monthN = date.getUTCMonth() + 1,
        dayN = date.getUTCDate(),
        month = monthN.toString(), day = dayN.toString();
    if (monthN < 10) {
        month = "0" + monthN.toString();
    }
    if (dayN < 10) {
        day = "0" + dayN.toString();
    }
    let currentYMD = date.getUTCFullYear().toString() + month + day;
    console.log("==== current YMD: " + currentYMD);

    return currentYMD;
}
