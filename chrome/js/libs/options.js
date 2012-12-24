const searchURL = "http://m.bus55.ru/index.php/search";

new (function NotificationOptions() {
    this.timeFrom = 540;
    this.timeTo = 570;
    this.notificationService = new NotificationSerivce();
    var self = this;

    $(document).ready(init);

    function init() {
        initCancelKey();
        initSettings();
        readSavedNotifications();
        initAddNotificationListener();
        initSearchFormClickListener();
        initSubmitButtonListener();
        initTypeOfTransportListener();
        $('#submitButton').button();
        $('#allTransportType').button();
        $('#customTransportType').buttonset();
    }

    function initSettings() {
        $("#openSettings").click(function (event) {
            event.preventDefault();
            $("#settings").fadeIn();
        })
        $("#saveSettingsButton").click(function (event) {
            event.preventDefault();
            $("#settings").fadeOut();
        })
    }

    function initCancelKey() {
        $(document).keyup(function (event) {
            if (event.keyCode == 27) {
                event.preventDefault();
                $('#searchResult').fadeOut();
                $('#directionsAndRoutes').fadeOut();
                $('#timeSettings').fadeOut();
                $('#submitButton').fadeOut();
                $('#searchDirection').fadeOut();
                $('#addNotification').slideDown();
                $('#mainForm').fadeOut();
                $('#searchStation input').val("");
            }
        });
    }

    function readSavedNotifications() {
        $('#savedNotifications').empty();
        $('#noNotificationMessage').show();
        var gridFromLocalStorage = localStorage.getItem("notificationGrid");
        if (gridFromLocalStorage) {
            var ul = document.createElement('ul');
            $('#noNotificationMessage').hide();
            if (self.notificationService.getLength() <= 0) {
                $('#noNotificationMessage').show();
            } else {
                var notificationsTable = createNotificationsTable();
                var tbody = $(notificationsTable).find('tbody');
                for (var i = 0; i < self.notificationService.getLength(); i++) {
                    var notificationItem = self.notificationService.getItem(i);
                    var tableRow = document.createElement('tr');
                    //checkbox
                    var enabledCheckBox = createEnabledCheckbox(notificationItem, i);
                    $(tableRow).append($('<td>').append(enabledCheckBox).attr('align', 'center'));
                    //station
                    var link = document.createElement('a');
                    $(link).attr("href", notificationItem.stationUrl);
                    $(link).attr("target", "_blank");
                    $(link).text(notificationItem.station);
                    $(tableRow).append($('<td>').append(link));
                    //routes
                    $(tableRow).append($('<td>').text(notificationItem.routes).attr('align', 'center'));
                    //when
                    $(tableRow).append($('<td>').text("с " + getTime(notificationItem.startTime) + " по " + getTime(notificationItem.endTime)));
                    //timeDiff
                    $(tableRow).append($('<td>').text(notificationItem.timeToCome + " мин.").attr('align', 'center'));
                    //delete
                    var deleteButton = createDeleteButton(i);
                    $(tableRow).append($('<td>').append(deleteButton).attr('align', 'center'));
                    $(tbody).append(tableRow);
                    if (self.notificationService.getLength() >= 5) {
                        $("#addNotification").hide();
                    } else {
                        $("#addNotification").show();
                    }
                }
                $('#savedNotifications').append(notificationsTable);
            }
        }
    }

    function createItemTest(notificationItem) {
        return "О прибытии транспорта c "
            + getTime(notificationItem.startTime)
            + " до "
            + getTime(notificationItem.endTime)
            + " по маршрутам: "
            + notificationItem.routes
            + ", на остановку "
            + notificationItem.station;
    }

    function createStationText(notificationItem) {
        return notificationItem.station;
    }

    function createNotificationsTable() {
        var table = document.createElement('table');
        $(table).addClass("tableizer-table");
        var firstRow = document.createElement('tr');
        $(firstRow).addClass("tableizer-firstrow");
        $(firstRow).append($('<th>').text("Включено"));
        $(firstRow).append($('<th>').text("Остановка"));
        $(firstRow).append($('<th>').text("Маршруты"));
        $(firstRow).append($('<th>').text("Когда уведомлять"));
        $(firstRow).append($('<th>').text("Время до прибытия"));
        $(firstRow).append($('<th>').text("Удалить"));
        $(table).append(firstRow);
        return table;
    }

    function createEnabledCheckbox(notificationItem, index) {
        var enabledCheckBox = document.createElement('input');
        $(enabledCheckBox).attr("type", "checkbox");
        if (notificationItem.isActive) {
            $(enabledCheckBox).attr("checked", "true");
        }
        $(enabledCheckBox).click(setActive(event, index));
        return enabledCheckBox;
    }

    function createDeleteButton(index) {
        var deleteButton = document.createElement('div');
        $(deleteButton).addClass("deleteButton");
        $(deleteButton).click(deleteItem(index));
        return deleteButton;
    }


    deleteItem = function (index) {
        this.index = index;
        return function () {
            self.notificationService.removeNotificationItemByIndex(index);
            readSavedNotifications();
        }
    }

    setActive = function (event, index) {
        this.index = index;
        return  function (event) {
            var checked = !!$(event.target).attr('checked');
            self.notificationService.setEnabled(index, checked)
            readSavedNotifications();
        }
    }

    $(function () {
        var nowDate = new Date();
        var now = nowDate.getHours() * 60 + nowDate.getMinutes();
        $("#slider-range").slider({
            range:true, min:360, max:1440, values:[ now, now + 60], slide:function (event, ui) {
                self.timeFrom = $("#slider-range").slider("values", 0);
                self.timeTo = $("#slider-range").slider("values", 1);
                $("#amount").val("с " + getTime(ui.values[ 0 ]) + " по " + getTime(ui.values[ 1 ]));
            } });
        self.timeFrom = $("#slider-range").slider("values", 0);
        self.timeTo = $("#slider-range").slider("values", 1);
        $("#amount").val("с " +
            getTime($("#slider-range").slider("values", 0))
            + " по " +
            getTime($("#slider-range").slider("values", 1))
        );
    });

    function getTime(globalMinutes) {
        var hours, minutes;
        hours = globalMinutes / 60 | 0;
        minutes = globalMinutes - hours * 60;
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        return hours + ":" + minutes;

    }

    function initTypeOfTransportListener() {
        $('#allTransportType').click(function (event) {
            var isAllTransport = $(event.target).attr('checked');
            $('#customTransportType>li>input').attr('checked', !isAllTransport);
            if (isAllTransport) {
                $('#customTransportType').fadeOut();
            } else {
                $('#customTransportType').fadeIn();
            }
        })
    }

    function initAddNotificationListener() {
        $("#addNotification").click(function (event) {
            event.preventDefault();
            $("#addNotification").slideUp();
            $("#mainForm").fadeIn();
            $("#searchEditBox").focus();
        });
    }

    function initSearchFormClickListener() {
        $("#searchButton").click(function (event) {
            var searchText = $('#searchStation input').val();
            $.post(searchURL, { search:searchText },
                function (data) {
                    updateSearchResults(data);
                });
            $('#searchResult').fadeIn();
        });
        $("#searchEditBox").keyup(function (event) {
            if (event.keyCode == 13) {
                event.preventDefault();
                $("#searchButton").click();
            }
        });

    }

    function initDirectionClickListener() {
        $('a').click(function (event) {
            event.preventDefault();
        });
        $('#searchDirection a').click(function (event) {
                event.preventDefault();
                $('#searchDirection a').not(event.target).removeClass('selected').addClass('item');
                $(event.target).removeClass('item').addClass('selected');
                $('#directionsAndRoutes').fadeIn();
                showRoutesForDirection($(event.target).parent().find('.routesString')[0]);
            }
        );
    }

    function updateSearchResults(data) {
        $('#searchError').fadeOut();
        $('#searchResult').hide();
        var bullets = $(data).find(".bullet");
        $('#searchLinks').empty();
        var fragment = document.createDocumentFragment()
        if ($(data).find(".bullet a").size() > 0) {
            $('#searchResult').show();
            for (var i = 0; i < bullets.size(); i++) {
                var li = document.createElement('li');
                var bullet = $(bullets[i]);
                $(li).append($(bullet).find("a")).addClass('ui-widget-content');
                fragment.appendChild(li);
            }
            $('#searchLinks').append(fragment);
            $('#searchLinks li a').addClass('item');
            $('#searchLinks').selectable({selecting:function (event, ui) {
                $(ui.selecting).find('a').click();
            }});
            initLinkListener();
        } else {
            $("#searchError").focus(function () {
                this.select();
            });
            $('#searchError').fadeIn();
        }

    }

    function updateDirectionResults(data) {
        var bullets = $(data).find(".bullet");
        $('#searchDirectionList').empty();
        var fragment = document.createDocumentFragment();
        for (var i = 0; i < bullets.size(); i++) {
            var li = document.createElement('li');
            var bullet = $(bullets[i]);
            var anchors = $(bullet).find("a");
            anchors.addClass('item');
            $(li).append(anchors).addClass('ui-widget-content');
            var hiddenDivWithRoutes = document.createElement('div')
            $(hiddenDivWithRoutes).addClass('routesString');
            makeInvisible(hiddenDivWithRoutes);
            $(hiddenDivWithRoutes).text(bullet.find('.gray')[0].textContent)
            $(li).append(hiddenDivWithRoutes);
            fragment.appendChild(li);
            $('#searchDirectionList').selectable({selecting:function (event, ui) {
                $(ui.selecting).find('a').click();
            }});
        }
        $('#searchDirectionList').append(fragment);
        initDirectionClickListener()
    }

    function makeInvisible(elem) {
        elem.style.display = 'none';
        elem.style.height = '0';
        elem.style.width = '0';
        elem.style.opacity = '1';
    }

    function showRoutesForDirection(sourceElement) {
        $('#directionsAndRoutes > ul').empty();
        var routeArray = removeDuplicates(sourceElement.textContent.trim().split(','));

        for (var i = 0; i < routeArray.length; i++) {
            if (routeArray[i].trim()) {
                var checkbox = document.createElement('input');
                $(checkbox).attr('type', "checkbox");
                $(checkbox).val(routeArray[i]);
                $(checkbox).attr('id', 'check' + i);
                var label = document.createElement('label');
                label.setAttribute('for', 'check' + i);
                label.appendChild(document.createTextNode(routeArray[i]));
                $('#directionsAndRoutes > ul').append(checkbox);
                $('#directionsAndRoutes > ul').append(label);
            }

        }
        $("#routes").buttonset();
        if (routeArray.length == 0) {
            $('#typeOfTransport').fadeOut();
        } else {
            $('#typeOfTransport').fadeIn();
        }
        $('#timeSettings').fadeIn();
        $('#submitButton').fadeIn();
    }

    function initLinkListener() {
        $('#searchResult li a').click(function (event) {
                event.preventDefault();
                $('#searchResult a').not(event.target).removeClass('selected').addClass('item');
                $(event.target).removeClass('item').addClass('selected');

                $('#searchLinks a').not(event.target).removeClass('selected');
                $(event.target).addClass('selected');
                $.post($(event.target).attr('href'),
                    function (data) {
                        updateDirectionResults(data);
                    });
                $('#searchDirection').fadeIn();
                $('#directionsAndRoutes').fadeOut();
                $('#typeOfTransport').fadeOut();
                $('#timeSettings').fadeOut();
                $('#submitButton').fadeOut();
            }
        );
    }

    function removeDuplicates(arr) {
        var sorted_arr = arr.sort();
        var results = [];
        for (var i = 0; i < arr.length; i++) {
            if (results.length > 0 || results[results.length - 1] != sorted_arr[i]) {
                results.push(sorted_arr[i]);
            }
        }
        return results;
    }

//todo add ability to disable submitting button until all parameters are set correctly
//todo when form submitted, all previous generated components should be removed
//todo slider should be instead textbox to enter timeToCome
    function initSubmitButtonListener() {
        $("#submitButton").click(function (event) {
            //todo get route number from url to save correctness of following requests
            var url = $('#searchDirectionList .selected').attr("href");
            var directionStation = $('#searchDirectionList .selected').text();
            var routes = getSelectedRoutes();
            if (routes.length > 0) {
                var timeToCome = $('#timeToCome').val();
                var notificationItem = new NotificationItem(url, routes, self.timeFrom, self.timeTo, timeToCome);
                notificationItem.station = $('#searchResult .selected').text() + "(в сторону " + directionStation + ")";
                self.notificationService.addNotification(notificationItem);
                $('#searchResult').fadeOut();
                $('#directionsAndRoutes').fadeOut();
                $('#timeSettings').fadeOut();
                $('#submitButton').fadeOut();
                $('#searchDirection').fadeOut();
                $('#addNotification').slideDown();
                $('#mainForm').fadeOut();
                $('#searchStation input').val("");
                readSavedNotifications();
            }
        })
    }

    function getSelectedRoutes() {
        var res = []
        $('#directionsAndRoutes > ul input').each(function () {
            if ($(this).attr('checked')) {
                res.push($.trim($(this).val()));
            }
        })
        return res;
    }
})
    ();
