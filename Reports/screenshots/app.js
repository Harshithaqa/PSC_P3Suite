var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var convertTimestamp = function (timestamp) {
    var d = new Date(timestamp),
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),
        dd = ('0' + d.getDate()).slice(-2),
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),
        ampm = 'AM',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh === 0) {
        h = 12;
    }

    // ie: 2013-02-18, 8:35 AM
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

    return time;
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    } else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    } else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};

//</editor-fold>

app.controller('ScreenshotReportController', ['$scope', '$http', 'TitleService', function ($scope, $http, titleService) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    this.warningTime = 1400;
    this.dangerTime = 1900;
    this.totalDurationFormat = clientDefaults.totalDurationFormat;
    this.showTotalDurationIn = clientDefaults.showTotalDurationIn;

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
        if (initialColumnSettings.warningTime) {
            this.warningTime = initialColumnSettings.warningTime;
        }
        if (initialColumnSettings.dangerTime) {
            this.dangerTime = initialColumnSettings.dangerTime;
        }
    }


    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };
    this.hasNextScreenshot = function (index) {
        var old = index;
        return old !== this.getNextScreenshotIdx(index);
    };

    this.hasPreviousScreenshot = function (index) {
        var old = index;
        return old !== this.getPreviousScreenshotIdx(index);
    };
    this.getNextScreenshotIdx = function (index) {
        var next = index;
        var hit = false;
        while (next + 2 < this.results.length) {
            next++;
            if (this.results[next].screenShotFile && !this.results[next].pending) {
                hit = true;
                break;
            }
        }
        return hit ? next : index;
    };

    this.getPreviousScreenshotIdx = function (index) {
        var prev = index;
        var hit = false;
        while (prev > 0) {
            prev--;
            if (this.results[prev].screenShotFile && !this.results[prev].pending) {
                hit = true;
                break;
            }
        }
        return hit ? prev : index;
    };

    this.convertTimestamp = convertTimestamp;


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };

    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.totalDuration = function () {
        var sum = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.duration) {
                sum += result.duration;
            }
        }
        return sum;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };


    var results = [
    {
        "description": "psc url|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/ - Failed to find a valid digest in the 'integrity' attribute for resource 'https://www.googletagmanager.com/gtag/js?id=G-YKZL1DE587' with computed SHA-256 integrity 'BNNqogAG1gdb7zsbMkZfHapjy6oEP6raPLm4JQJsXNc='. The resource has been blocked.",
                "timestamp": 1604596891913,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/%20https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1604596892384,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/%20https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1604596897793,
                "type": ""
            }
        ],
        "screenShotFile": "000a0067-00ab-007f-000a-00ae005700b8.png",
        "timestamp": 1604596887732,
        "duration": 14777
    },
    {
        "description": "TS-invalidemail|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://dev.payschoolscentral.com/vendor.js 87269:16 \"\\n      It looks like you're using the disabled attribute with a reactive form directive. If you set disabled to true\\n      when you set up this control in your component class, the disabled attribute will actually be set in the DOM for\\n      you. We recommend using this approach to avoid 'changed after checked' errors.\\n       \\n      Example: \\n      form = new FormGroup({\\n        first: new FormControl({value: 'Nancy', disabled: true}, Validators.required),\\n        last: new FormControl('Drew', Validators.required)\\n      });\\n    \"",
                "timestamp": 1604596903976,
                "type": ""
            }
        ],
        "screenShotFile": "00e3002a-00cb-00ca-004c-002600da002e.png",
        "timestamp": 1604596902908,
        "duration": 61141
    },
    {
        "description": "User should registered successfully|PSCpageobjects",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": [
            "Failed: No element found using locator: By(xpath, /html[1]/body[1]/div[3]/div[1]/div[1]/snack-bar-container[1]/simple-snack-bar[1]/span[1])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(xpath, /html[1]/body[1]/div[3]/div[1]/div[1]/snack-bar-container[1]/simple-snack-bar[1]/span[1])\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)Error\n    at ElementArrayFinder.applyAction_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as getText] (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as getText] (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:831:22)\n    at UserContext.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3.js:192:26)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\nFrom: Task: Run it(\"User should registered successfully\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError\n    at D:\\Final Automation\\PSC_P3Suite\\P3.js:126:2\n    at D:\\Final Automation\\PSC_P3Suite\\node_modules\\jasmine-data-provider\\src\\index.js:37:22\n    at Array.forEach (<anonymous>)\n    at D:\\Final Automation\\PSC_P3Suite\\node_modules\\jasmine-data-provider\\src\\index.js:30:24\n    at Suite.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3.js:125:9)\n    at addSpecsToSuite (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3.js:3:1)"
        ],
        "browserLogs": [],
        "screenShotFile": "005200a2-004c-00f9-00f6-0045006d00c6.png",
        "timestamp": 1604596964375,
        "duration": 59709
    },
    {
        "description": "TS-forgotpassinvalidemail|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/ - Failed to find a valid digest in the 'integrity' attribute for resource 'https://www.googletagmanager.com/gtag/js?id=G-YKZL1DE587' with computed SHA-256 integrity 'BNNqogAG1gdb7zsbMkZfHapjy6oEP6raPLm4JQJsXNc='. The resource has been blocked.",
                "timestamp": 1604597024550,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/%20https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1604597024891,
                "type": ""
            }
        ],
        "screenShotFile": "008f008c-00ff-0017-0045-008e00d6005a.png",
        "timestamp": 1604597024431,
        "duration": 9293
    },
    {
        "description": "TS-forgotpassinvalidemail|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "005a0066-0079-0053-0013-005700700071.png",
        "timestamp": 1604597034091,
        "duration": 19155
    },
    {
        "description": "TS-InvalidEmail|PSCpageobjects",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": [
            "Failed: No element found using locator: By(xpath, //div//mat-error[contains(text(),\" Password is required\")])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(xpath, //div//mat-error[contains(text(),\" Password is required\")])\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at runMicrotasks (<anonymous>)\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)Error\n    at ElementArrayFinder.applyAction_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as getText] (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as getText] (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:831:22)\n    at UserContext.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3.js:285:21)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\nFrom: Task: Run it(\"TS-InvalidEmail\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError\n    at D:\\Final Automation\\PSC_P3Suite\\P3.js:264:5\n    at D:\\Final Automation\\PSC_P3Suite\\node_modules\\jasmine-data-provider\\src\\index.js:37:22\n    at Array.forEach (<anonymous>)\n    at D:\\Final Automation\\PSC_P3Suite\\node_modules\\jasmine-data-provider\\src\\index.js:30:24\n    at Suite.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3.js:263:1)\n    at addSpecsToSuite (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3.js:3:1)"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/ - Failed to find a valid digest in the 'integrity' attribute for resource 'https://www.googletagmanager.com/gtag/js?id=G-YKZL1DE587' with computed SHA-256 integrity 'BNNqogAG1gdb7zsbMkZfHapjy6oEP6raPLm4JQJsXNc='. The resource has been blocked.",
                "timestamp": 1604597053744,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/%20https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1604597054710,
                "type": ""
            }
        ],
        "screenShotFile": "0062006e-001d-00c0-00d5-00f5008c00b2.png",
        "timestamp": 1604597053631,
        "duration": 17049
    },
    {
        "description": "TS-InvalidEmail|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00fe00e0-00cf-0071-0059-0011002200a3.png",
        "timestamp": 1604597071059,
        "duration": 4252
    },
    {
        "description": "TS-InvalidEmail|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00fe0062-0098-009e-0043-008200a200fb.png",
        "timestamp": 1604597075672,
        "duration": 13937
    },
    {
        "description": "TS-InvalidEmail|PSCpageobjects",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": [
            "Failed: No element found using locator: By(xpath, //span[contains(text(),\"We are sorry, either your Email address or password is invalid.\")])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(xpath, //span[contains(text(),\"We are sorry, either your Email address or password is invalid.\")])\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at runMicrotasks (<anonymous>)\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)Error\n    at ElementArrayFinder.applyAction_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as getText] (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as getText] (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:831:22)\n    at UserContext.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3.js:373:14)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\nFrom: Task: Run it(\"TS-InvalidEmail\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError\n    at D:\\Final Automation\\PSC_P3Suite\\P3.js:351:5\n    at D:\\Final Automation\\PSC_P3Suite\\node_modules\\jasmine-data-provider\\src\\index.js:37:22\n    at Array.forEach (<anonymous>)\n    at D:\\Final Automation\\PSC_P3Suite\\node_modules\\jasmine-data-provider\\src\\index.js:30:24\n    at Suite.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3.js:263:1)\n    at addSpecsToSuite (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3.js:3:1)"
        ],
        "browserLogs": [],
        "screenShotFile": "003200cd-00cc-008a-00a5-007d006b003e.png",
        "timestamp": 1604597089973,
        "duration": 16847
    },
    {
        "description": "TS-Addnewcard|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/ - Failed to find a valid digest in the 'integrity' attribute for resource 'https://www.googletagmanager.com/gtag/js?id=G-YKZL1DE587' with computed SHA-256 integrity 'BNNqogAG1gdb7zsbMkZfHapjy6oEP6raPLm4JQJsXNc='. The resource has been blocked.",
                "timestamp": 1604597107309,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/%20https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1604597107771,
                "type": ""
            }
        ],
        "screenShotFile": "002b003a-00e6-00df-00e9-00590024007b.png",
        "timestamp": 1604597107194,
        "duration": 58692
    },
    {
        "description": "TS-Addnewcard|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "002d0029-00fd-0043-001e-0047008c0092.png",
        "timestamp": 1604597166239,
        "duration": 50696
    },
    {
        "description": "Should update the secure account successfully|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "006f00c5-0017-00cd-00e4-00eb00910016.png",
        "timestamp": 1604597217259,
        "duration": 55069
    },
    {
        "description": "TS-AddStudent|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "007a00ee-00cd-000e-0089-00df00d500bb.png",
        "timestamp": 1604597272662,
        "duration": 56270
    },
    {
        "description": "TS-AddCreditCardPayment|PSCpageobjects",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": [
            "Failed: No element found using locator: By(xpath, /html[1]/body[1]/div[2]/div[1]/div[1]/snack-bar-container[1]/simple-snack-bar[1]/span[1])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(xpath, /html[1]/body[1]/div[2]/div[1]/div[1]/snack-bar-container[1]/simple-snack-bar[1]/span[1])\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at runMicrotasks (<anonymous>)\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)Error\n    at ElementArrayFinder.applyAction_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as getText] (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as getText] (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:831:22)\n    at UserContext.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3.js:974:35)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\nFrom: Task: Run it(\"TS-AddCreditCardPayment\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError\n    at D:\\Final Automation\\PSC_P3Suite\\P3.js:790:7\n    at D:\\Final Automation\\PSC_P3Suite\\node_modules\\jasmine-data-provider\\src\\index.js:37:22\n    at Array.forEach (<anonymous>)\n    at D:\\Final Automation\\PSC_P3Suite\\node_modules\\jasmine-data-provider\\src\\index.js:30:24\n    at Suite.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3.js:787:3)\n    at addSpecsToSuite (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3.js:3:1)"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/ - Failed to find a valid digest in the 'integrity' attribute for resource 'https://www.googletagmanager.com/gtag/js?id=G-YKZL1DE587' with computed SHA-256 integrity 'BNNqogAG1gdb7zsbMkZfHapjy6oEP6raPLm4JQJsXNc='. The resource has been blocked.",
                "timestamp": 1604597329373,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/%20https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1604597329679,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/vendor.js 76962:18 \"ERROR\" DOMException: Failed to set the 'maxLength' property on 'HTMLInputElement': The maxLength provided (15) is less than the minimum bound (16).\n    at EmulatedEncapsulationDomRenderer2.push../node_modules/@angular/platform-browser/fesm5/platform-browser.js.DefaultDomRenderer2.setProperty (https://dev.payschoolscentral.com/vendor.js:134885:18)\n    at BaseAnimationRenderer.push../node_modules/@angular/platform-browser/fesm5/animations.js.BaseAnimationRenderer.setProperty (https://dev.payschoolscentral.com/vendor.js:133483:27)\n    at setElementProperty (https://dev.payschoolscentral.com/vendor.js:82349:19)\n    at checkAndUpdateElementValue (https://dev.payschoolscentral.com/vendor.js:82300:13)\n    at checkAndUpdateElementDynamic (https://dev.payschoolscentral.com/vendor.js:82272:13)\n    at checkAndUpdateNodeDynamic (https://dev.payschoolscentral.com/vendor.js:84614:20)\n    at checkAndUpdateNode (https://dev.payschoolscentral.com/vendor.js:84567:16)\n    at prodCheckAndUpdateNode (https://dev.payschoolscentral.com/vendor.js:85105:5)\n    at Object.eval [as updateRenderer] (ng:///ManagePaymentMethodsModule/AddPaymentMethodsComponent.ngfactory.js:806:5)\n    at Object.updateRenderer (https://dev.payschoolscentral.com/vendor.js:84895:70)",
                "timestamp": 1604597430656,
                "type": ""
            }
        ],
        "screenShotFile": "00cd0066-002f-0033-001f-005600870014.png",
        "timestamp": 1604597329247,
        "duration": 206496
    },
    {
        "description": "TS-UserLogin|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/ - Failed to find a valid digest in the 'integrity' attribute for resource 'https://www.googletagmanager.com/gtag/js?id=G-YKZL1DE587' with computed SHA-256 integrity 'BNNqogAG1gdb7zsbMkZfHapjy6oEP6raPLm4JQJsXNc='. The resource has been blocked.",
                "timestamp": 1604597544221,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/%20https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1604597545353,
                "type": ""
            }
        ],
        "screenShotFile": "007c0028-0024-007d-002b-0024006c0086.png",
        "timestamp": 1604597536080,
        "duration": 145299
    },
    {
        "description": "TS-UserLogin|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00df0022-00fa-00b2-0005-009700cc0077.png",
        "timestamp": 1604597681724,
        "duration": 104961
    },
    {
        "description": "TS-Addnewcard|PSCpageobjects",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": [
            "Expected false to be true.",
            "Failed: No element found using locator: By(xpath, //span[contains(text(),\"USE NEW CARD\")])"
        ],
        "trace": [
            "Error: Failed expectation\n    at UserContext.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3validations.js:261:37)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7",
            "NoSuchElementError: No element found using locator: By(xpath, //span[contains(text(),\"USE NEW CARD\")])\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at runMicrotasks (<anonymous>)\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)Error\n    at ElementArrayFinder.applyAction_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as getText] (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as getText] (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:831:22)\n    at UserContext.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3validations.js:284:20)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\nFrom: Task: Run it(\"TS-Addnewcard\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError\n    at D:\\Final Automation\\PSC_P3Suite\\P3validations.js:184:5\n    at D:\\Final Automation\\PSC_P3Suite\\node_modules\\jasmine-data-provider\\src\\index.js:37:22\n    at Array.forEach (<anonymous>)\n    at D:\\Final Automation\\PSC_P3Suite\\node_modules\\jasmine-data-provider\\src\\index.js:30:24\n    at Suite.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3validations.js:182:3)\n    at addSpecsToSuite (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\P3validations.js:3:1)"
        ],
        "browserLogs": [],
        "screenShotFile": "001800fc-00d8-002a-00a4-0016009500d4.png",
        "timestamp": 1604597787021,
        "duration": 179453
    },
    {
        "description": "TS-UserLogin|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "009c0075-0041-005f-003d-000b000700d3.png",
        "timestamp": 1604597966852,
        "duration": 71165
    },
    {
        "description": "TS-fund|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/ - Failed to find a valid digest in the 'integrity' attribute for resource 'https://www.googletagmanager.com/gtag/js?id=G-YKZL1DE587' with computed SHA-256 integrity 'BNNqogAG1gdb7zsbMkZfHapjy6oEP6raPLm4JQJsXNc='. The resource has been blocked.",
                "timestamp": 1604598040268,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dev.payschoolscentral.com/%20https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1604598040719,
                "type": ""
            }
        ],
        "screenShotFile": "00150054-0037-00bf-003e-003500b0005f.png",
        "timestamp": 1604598038341,
        "duration": 53277
    },
    {
        "description": "Should add and remove the payment methods successfully|PSCpageobjects",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": [
            "Failed: No element found using locator: By(xpath, //div[contains(text(),\"31\")])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(xpath, //div[contains(text(),\"31\")])\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at runMicrotasks (<anonymous>)\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)Error\n    at ElementArrayFinder.applyAction_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as click] (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:831:22)\n    at UserContext.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\fees.js:42:27)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\nFrom: Task: Run it(\"Should add and remove the payment methods successfully\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError\n    at D:\\Final Automation\\PSC_P3Suite\\fees.js:11:5\n    at D:\\Final Automation\\PSC_P3Suite\\node_modules\\jasmine-data-provider\\src\\index.js:37:22\n    at Array.forEach (<anonymous>)\n    at D:\\Final Automation\\PSC_P3Suite\\node_modules\\jasmine-data-provider\\src\\index.js:30:24\n    at Suite.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\fees.js:10:3)\n    at addSpecsToSuite (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\fees.js:3:1)"
        ],
        "browserLogs": [],
        "screenShotFile": "0038006d-0017-00e7-00f0-008300b70088.png",
        "timestamp": 1604598091950,
        "duration": 65536
    },
    {
        "description": "Should display no fees for inactive patrons|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00bd0064-004e-009e-00ba-00c500960088.png",
        "timestamp": 1604598157825,
        "duration": 49415
    },
    {
        "description": "Should add and remove the payment methods successfully|PSCpageobjects",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": [
            "Failed: No element found using locator: By(xpath, /html[1]/body[1]/app-root[1]/app-full-layout[1]/app-dashboard[1]/div[2]/div[2]/form[1]/div[1]/div[2]/app-meals[1]/div[2]/div[1]/table[1]/tbody[1]/tr[2]/td[3]/span[1]/mat-icon[1])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(xpath, /html[1]/body[1]/app-root[1]/app-full-layout[1]/app-dashboard[1]/div[2]/div[2]/form[1]/div[1]/div[2]/app-meals[1]/div[2]/div[1]/table[1]/tbody[1]/tr[2]/td[3]/span[1]/mat-icon[1])\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at runMicrotasks (<anonymous>)\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)Error\n    at ElementArrayFinder.applyAction_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as click] (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:831:22)\n    at UserContext.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\email.js:32:22)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\nFrom: Task: Run it(\"Should add and remove the payment methods successfully\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError\n    at D:\\Final Automation\\PSC_P3Suite\\email.js:9:5\n    at D:\\Final Automation\\PSC_P3Suite\\node_modules\\jasmine-data-provider\\src\\index.js:37:22\n    at Array.forEach (<anonymous>)\n    at D:\\Final Automation\\PSC_P3Suite\\node_modules\\jasmine-data-provider\\src\\index.js:30:24\n    at Suite.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\email.js:8:3)\n    at addSpecsToSuite (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\Harshitha TN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\Final Automation\\PSC_P3Suite\\email.js:1:1)"
        ],
        "browserLogs": [],
        "screenShotFile": "001d003c-0012-00b8-0008-006300350062.png",
        "timestamp": 1604598207641,
        "duration": 38285
    },
    {
        "description": "Should navigate to account activation page|PSCpageobjects",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1436,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.183"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00c500e0-000e-001e-0052-003c00b2001d.png",
        "timestamp": 1604598246271,
        "duration": 85707
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});

    };

    this.setTitle = function () {
        var title = $('.report-title').text();
        titleService.setTitle(title);
    };

    // is run after all test data has been prepared/loaded
    this.afterLoadingJobs = function () {
        this.sortSpecs();
        this.setTitle();
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    } else {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.afterLoadingJobs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.afterLoadingJobs();
    }

}]);

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

//formats millseconds to h m s
app.filter('timeFormat', function () {
    return function (tr, fmt) {
        if(tr == null){
            return "NaN";
        }

        switch (fmt) {
            case 'h':
                var h = tr / 1000 / 60 / 60;
                return "".concat(h.toFixed(2)).concat("h");
            case 'm':
                var m = tr / 1000 / 60;
                return "".concat(m.toFixed(2)).concat("min");
            case 's' :
                var s = tr / 1000;
                return "".concat(s.toFixed(2)).concat("s");
            case 'hm':
            case 'h:m':
                var hmMt = tr / 1000 / 60;
                var hmHr = Math.trunc(hmMt / 60);
                var hmMr = hmMt - (hmHr * 60);
                if (fmt === 'h:m') {
                    return "".concat(hmHr).concat(":").concat(hmMr < 10 ? "0" : "").concat(Math.round(hmMr));
                }
                return "".concat(hmHr).concat("h ").concat(hmMr.toFixed(2)).concat("min");
            case 'hms':
            case 'h:m:s':
                var hmsS = tr / 1000;
                var hmsHr = Math.trunc(hmsS / 60 / 60);
                var hmsM = hmsS / 60;
                var hmsMr = Math.trunc(hmsM - hmsHr * 60);
                var hmsSo = hmsS - (hmsHr * 60 * 60) - (hmsMr*60);
                if (fmt === 'h:m:s') {
                    return "".concat(hmsHr).concat(":").concat(hmsMr < 10 ? "0" : "").concat(hmsMr).concat(":").concat(hmsSo < 10 ? "0" : "").concat(Math.round(hmsSo));
                }
                return "".concat(hmsHr).concat("h ").concat(hmsMr).concat("min ").concat(hmsSo.toFixed(2)).concat("s");
            case 'ms':
                var msS = tr / 1000;
                var msMr = Math.trunc(msS / 60);
                var msMs = msS - (msMr * 60);
                return "".concat(msMr).concat("min ").concat(msMs.toFixed(2)).concat("s");
        }

        return tr;
    };
});


function PbrStackModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;
    ctrl.convertTimestamp = convertTimestamp;
    ctrl.isValueAnArray = isValueAnArray;
    ctrl.toggleSmartStackTraceHighlight = function () {
        var inv = !ctrl.rootScope.showSmartStackTraceHighlight;
        ctrl.rootScope.showSmartStackTraceHighlight = inv;
    };
    ctrl.applySmartHighlight = function (line) {
        if ($rootScope.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return '';
    };
}


app.component('pbrStackModal', {
    templateUrl: "pbr-stack-modal.html",
    bindings: {
        index: '=',
        data: '='
    },
    controller: PbrStackModalController
});

function PbrScreenshotModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;

    /**
     * Updates which modal is selected.
     */
    this.updateSelectedModal = function (event, index) {
        var key = event.key; //try to use non-deprecated key first https://developer.mozilla.org/de/docs/Web/API/KeyboardEvent/keyCode
        if (key == null) {
            var keyMap = {
                37: 'ArrowLeft',
                39: 'ArrowRight'
            };
            key = keyMap[event.keyCode]; //fallback to keycode
        }
        if (key === "ArrowLeft" && this.hasPrevious) {
            this.showHideModal(index, this.previous);
        } else if (key === "ArrowRight" && this.hasNext) {
            this.showHideModal(index, this.next);
        }
    };

    /**
     * Hides the modal with the #oldIndex and shows the modal with the #newIndex.
     */
    this.showHideModal = function (oldIndex, newIndex) {
        const modalName = '#imageModal';
        $(modalName + oldIndex).modal("hide");
        $(modalName + newIndex).modal("show");
    };

}

app.component('pbrScreenshotModal', {
    templateUrl: "pbr-screenshot-modal.html",
    bindings: {
        index: '=',
        data: '=',
        next: '=',
        previous: '=',
        hasNext: '=',
        hasPrevious: '='
    },
    controller: PbrScreenshotModalController
});

app.factory('TitleService', ['$document', function ($document) {
    return {
        setTitle: function (title) {
            $document[0].title = title;
        }
    };
}]);


app.run(
    function ($rootScope, $templateCache) {
        //make sure this option is on by default
        $rootScope.showSmartStackTraceHighlight = true;
        
  $templateCache.put('pbr-screenshot-modal.html',
    '<div class="modal" id="imageModal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="imageModalLabel{{$ctrl.index}}" ng-keydown="$ctrl.updateSelectedModal($event,$ctrl.index)">\n' +
    '    <div class="modal-dialog modal-lg m-screenhot-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="imageModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="imageModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <img class="screenshotImage" ng-src="{{$ctrl.data.screenShotFile}}">\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <div class="pull-left">\n' +
    '                    <button ng-disabled="!$ctrl.hasPrevious" class="btn btn-default btn-previous" data-dismiss="modal"\n' +
    '                            data-toggle="modal" data-target="#imageModal{{$ctrl.previous}}">\n' +
    '                        Prev\n' +
    '                    </button>\n' +
    '                    <button ng-disabled="!$ctrl.hasNext" class="btn btn-default btn-next"\n' +
    '                            data-dismiss="modal" data-toggle="modal"\n' +
    '                            data-target="#imageModal{{$ctrl.next}}">\n' +
    '                        Next\n' +
    '                    </button>\n' +
    '                </div>\n' +
    '                <a class="btn btn-primary" href="{{$ctrl.data.screenShotFile}}" target="_blank">\n' +
    '                    Open Image in New Tab\n' +
    '                    <span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>\n' +
    '                </a>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

  $templateCache.put('pbr-stack-modal.html',
    '<div class="modal" id="modal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="stackModalLabel{{$ctrl.index}}">\n' +
    '    <div class="modal-dialog modal-lg m-stack-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="stackModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="stackModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <div ng-if="$ctrl.data.trace.length > 0">\n' +
    '                    <div ng-if="$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer" ng-repeat="trace in $ctrl.data.trace track by $index"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                    <div ng-if="!$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in $ctrl.data.trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '                <div ng-if="$ctrl.data.browserLogs.length > 0">\n' +
    '                    <h5 class="modal-title">\n' +
    '                        Browser logs:\n' +
    '                    </h5>\n' +
    '                    <pre class="logContainer"><div class="browserLogItem"\n' +
    '                                                   ng-repeat="logError in $ctrl.data.browserLogs track by $index"><div><span class="label browserLogLabel label-default"\n' +
    '                                                                                                                             ng-class="{\'label-danger\': logError.level===\'SEVERE\', \'label-warning\': logError.level===\'WARNING\'}">{{logError.level}}</span><span class="label label-default">{{$ctrl.convertTimestamp(logError.timestamp)}}</span><div ng-repeat="messageLine in logError.message.split(\'\\\\n\') track by $index">{{ messageLine }}</div></div></div></pre>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <button class="btn btn-default"\n' +
    '                        ng-class="{active: $ctrl.rootScope.showSmartStackTraceHighlight}"\n' +
    '                        ng-click="$ctrl.toggleSmartStackTraceHighlight()">\n' +
    '                    <span class="glyphicon glyphicon-education black"></span> Smart Stack Trace\n' +
    '                </button>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

    });
