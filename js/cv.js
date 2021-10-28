function getMonth(d) {
  return d.toLocaleString("en", {
    month: "long",
  });
}

function duration(seconds) {
  let output = [];
  let remainder = parseInt(seconds, 10);
  const durations = [
    // Number of seconds in
    365 * 24 * 60 * 60, // a year
    30 * 24 * 60 * 60, // a month
    24 * 60 * 60, // a day
    60 * 60, // a hour
    1 * 60, // a minute
  ];
  durations.forEach((divisor, index) => {
    const quotient = Math.abs(parseInt(`${remainder / divisor}`, 10));
    remainder = Math.abs(remainder % divisor);
    output.push(quotient);
    if (index === durations.length - 1) {
      output.push(remainder);
    }
  });
  return output;
}

const units = ["year", "month", "day", "hour", "minute", "second"];

let qs = {
  getAll: function () {
    return [];
  },
};
try {
  qs = new URLSearchParams(location.search);
} catch (exception) {
  console.warn("failed to parse query parameters");
}

function load_json() {
  language = document.location.hash.replace("#", "") || "english";

  var file = language + ".json";
  var success = function (data) {
    data.category.forEach(function (category) {
      if (category.experience) {
        const highlights = qs.getAll(category.key);
        category.experience = category.experience.filter(function (experience) {
          if (highlights.length) {
            return highlights.includes(experience.key);
          } else {
            return experience.highlight;
          }
        });
        category.experience.forEach(function (experience) {
          if (experience.date) {
            var date = {};
            date.start = new Date(experience.date.start);
            date.end = experience.date.end
              ? new Date(experience.date.end)
              : new Date();
            if (date.start.getFullYear() === date.end.getFullYear()) {
              experience.date.start = getMonth(date.start);
            } else {
              experience.date.start = `${getMonth(
                date.start
              )} ${date.start.getFullYear()}`;
            }
            experience.date.end = experience.date.end
              ? `${getMonth(date.end)} ${date.end.getFullYear()}`
              : "present";
            const d = duration(((date.end || new Date()) - date.start) / 1000);
            const index = d.findIndex(function (v, index) {
              return d[index] !== 0;
            });
            experience.date.duration = `${d[index]} ${
              d[index] === 1 ? units[index] : `${units[index]}s`
            }`;
          }

          if (experience.value) {
            const highlights = qs.getAll(experience.key);
            experience.value = experience.value.filter(function (v) {
              if (highlights.length) {
                return highlights.includes(v.key);
              } else {
                return v.highlight;
              }
            });
          }
        });
      }
    });

    new Barbe.View("template-title", { data: data }).grow();
    new Barbe.View("template-personal", { data: data }).grow();
    new Barbe.View("template-category", { data: data }).grow(function () {});
  };

  fetch("data/" + file, {})
    .then(function (response) {
      return response.json();
    })
    .then(success);
}

window.addEventListener("hashchange", load_json);

load_json();
