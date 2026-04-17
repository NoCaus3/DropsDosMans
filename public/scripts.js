function setupCountdown(campaignSelector, startTimeMillis, endTimeMillis) {
    var second = 1000;
    var minute = second * 60;
    var hour = minute * 60;
    var day = hour * 24;

    function calculateRemaining() {
        var now = new Date().getTime();
        return now >= startTimeMillis && now < endTimeMillis ? endTimeMillis - now : 0;
    }

    var didRefresh = false;
    var previousGap = calculateRemaining();

    function countdown() {
        var gap = calculateRemaining();
        var shouldRefresh = previousGap > day && gap <= day || previousGap > 0 && gap === 0;

        previousGap = gap;

        var textDay = Math.floor(gap / day);
        var textHour = Math.floor((gap % day) / hour);
        var textMinute = Math.floor((gap % hour) / minute);
        var textSecond = Math.floor((gap % minute) / second);

        if (document.querySelector(campaignSelector + ' .timer')) {
            document.querySelector(campaignSelector + ' .day').innerText = textDay;
            document.querySelector(campaignSelector + ' .hour').innerText = textHour;
            document.querySelector(campaignSelector + ' .minute').innerText = textMinute;
            document.querySelector(campaignSelector + ' .second').innerText = textSecond;
        }

        if (shouldRefresh && !didRefresh) {
            didRefresh = true;
            setTimeout(function () {
                window.location.reload();
            }, 30000 + Math.random() * 90000);
        }
    }

    countdown();
    setInterval(countdown, 1000);
}
    
(function () {
    setInterval(function () {
        fetch('/?handler=DropsStats', { cache: 'no-store' }).then(function (response) {
            if (!response.ok) {
                throw new Error('Failed to load updated drops stats');
            }

            return response.json();
        }).then(function (data) {
            var targets = document.querySelectorAll('.drop-counter');
            for (var i = 0; i < targets.length; i++) {
                if (!targets[i].dataset || !targets[i].dataset.itemid) {
                    continue;
                }

                var count = data.items[targets[i].dataset.itemid];
                targets[i].textContent = typeof count === 'number' ? count.toLocaleString() : '0';
            }

            var accountsElem = document.querySelector('.drop-account-count');
            if (accountsElem) {
                accountsElem.textContent = data.accounts.toLocaleString();
            }

            var totalElem = document.querySelector('.drop-total-count');
            if (totalElem) {
                var total = 0;
                for (var key in data.items) {
                    total += data.items[key];
                }

                totalElem.textContent = total.toLocaleString();
            }
        });
    }, 61573);
})();

document.addEventListener("DOMContentLoaded", function (event) {
    if (!document.querySelectorAll || !document.body.classList) {
        return;
    }

    var currentTarget;
    function makeAccordion(accordion) {
        var title = accordion.querySelector('.title');
        if (title) {
            accordion.classList.add('collapsed');
            title.addEventListener('click', function () {
                if (currentTarget) {
                    currentTarget.classList.add('collapsed');
                }

                currentTarget = accordion;
                currentTarget.classList.remove('collapsed');
            }, false);
        }
    }

    var accordions = document.querySelectorAll('.faq-question');
    for (var i = 0; i < accordions.length; i++) {
        makeAccordion(accordions[i]);
    }
});
