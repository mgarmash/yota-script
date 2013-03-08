var page = require('webpage').create();
var args = require('system').args;

var login = args[1];
var password = args[2];
var command = args[3];
var speed = args[4];

function waitFor(testFx, onReady) {
    var start = new Date().getTime(), condition = false, interval = setInterval(function () {
        if ((new Date().getTime() - start < 30000) && !condition) {
            condition = testFx();
        } else {
            if (!condition) {
                console.log("'waitFor()' timeout");
                phantom.exit(1);
            } else {
                onReady();
                clearInterval(interval);
            }
        }
    }, 250);
}

page.open('https://my.yota.ru/', function (status) {
    if (status !== 'success') {
        console.log('Unable to access network');
    }
    else {
        if (!login || !password || !command) {
            console.log("Неверно заданы аргументы\n");
            console.log("Usage: phantomjs ./yota.js login password [ check | list | set <desired-speed> ]");
            console.log("\tcheck\t- Показывает текущий план и остаток дней");
            console.log("\tlist\t- Показывает список доступных скоростей для команды set");
            console.log("\tset\t- Устанавливает скорость Интернета");
            phantom.exit();
        } else {
            page.evaluate(function (login, password) {
                $(":text[name=IDToken1]").val(login);
                $(":password[name=IDToken3]").val(password);
                $("#doSubmitLoginForm").click();
            }, login, password);
            waitFor(function () {
                return page.evaluate(function () {
                    return $(".tariff-choice-form").is(":visible");
                });
            }, function () {
                switch (command) {
                    case 'list' :
                        var variants = page.evaluate(function () {
                            var variants = [];
                            var f = $('.tariff-choice-form');
                            var steps = sliderData[f.find('input[name="product"]').val()].steps;
                            var offerCode = f.find('input[name="offerCode"]').val();

                            for (var i = 0; i < steps.length; i++) {
                                var speedNumber = steps[i].speedNumber;

                                variants[i] = (/max/.test(speedNumber) ? 'max : ' : speedNumber + ' : ') + (steps[i].name || steps[i].description) + ' (остаток ' + steps[i].remainNumber + ' ' + steps[i].remainString + ')' + (steps[i].code == offerCode ? ' * текущий тариф' : '');
                            }
                            return variants;
                        });
                        for (var i = 0; i < variants.length; i++) {
                            console.log(variants[i]);
                        }
                        phantom.exit();
                        break;
                    case 'set' :
                        var newOfferCode = page.evaluate(function (speed) {
                            var f = $('.tariff-choice-form');
                            var steps = sliderData[f.find('input[name="product"]').val()].steps;
                            var currentOfferCode = f.find('input[name="offerCode"]').val();
                            var offerCode = null;
                            var isDisablingAutoprolong = false;
                            for (var i = 0; i < steps.length; i++) {
                                if (steps[i].speedNumber == speed || (speed == 'max' && steps[i].speedNumber.contains('max'))) {
                                    offerCode = steps[i].code;
                                    isDisablingAutoprolong = steps[i].isDisablingAutoprolong;
                                }
                            }
                            if (offerCode && currentOfferCode != offerCode) {
                                f.find("form").append("<input type='hidden' name='isDisablingAutoprolong' value='" + isDisablingAutoprolong + "'/>");
                                f.find('[name="offerCode"]').val(offerCode);
                                f.find('[name="productOfferingCode"]').val(offerCode);
                                f.submit();
                            }
                            return offerCode;
                        }, speed);
                        waitFor(function () {
                                return page.evaluate(function (oc) {
                                    var f = $('.tariff-choice-form');
                                    return oc == f.find('input[name="offerCode"]').val();
                                }, newOfferCode)
                            },
                            function () {
                                phantom.exit();

                            });
                        break;
                    default:
                    case 'check' :
                        var current = page.evaluate(function () {
                            var result = '';
                            var f = $('.tariff-choice-form');
                            var steps = sliderData[f.find('input[name="product"]').val()].steps;
                            var offerCode = f.find('input[name="offerCode"]').val();
                            for (var i = 0; i < steps.length; i++) {
                                if (steps[i].code == offerCode) {
                                    result = steps[i].name + '(остаток ' + steps[i].remainNumber + ' ' + steps[i].remainString + ')';
                                    break;
                                }
                            }
                            return result;
                        });
                        console.log(current);
                        phantom.exit();
                        break;
                }
            });
        }
    }
});