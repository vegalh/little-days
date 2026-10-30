What I am building

I am building Little Days, a family activity planner that uses local weather forecasts and upcoming holidays to recommend age-appropriate activities and clothing suggestions for young children.

Who it is for

This tool is for parents of children ages 1–6 who want to spend meaningful time with their children but don’t always have time to plan activities. It helps parents find simple things to do based on the weather, their child’s age, and upcoming holidays.

The API

I plan to use two APIs:

1. Open-Meteo Weather API

* Documentation: https://open-meteo.com/en/docs
* Example URL: https://api.open-meteo.com/v1/forecast?latitude=42.36&longitude=-71.06&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=America%2FNew_York
* Fields I will use: time, temperature_2m_max, temperature_2m_min, precipitation_probability_max, and weather_code.

2. Nager.Date Public Holidays API

* Documentation: https://date.nager.at/Api
* Example URL: https://date.nager.at/api/v3/PublicHolidays/2026/US
* Fields I will use: date, localName, name, and countryCode.

The weather API provides forecasts, while the holiday API identifies upcoming public holidays. I will also include a small list of celebrations, such as Halloween, that may not appear in the public holiday API.

What the user chooses

Parents can enter their city, select their child’s age, and choose activities they want to add to their weekly calendar. Changing the city updates the weather forecast, while changing the child’s age updates the recommended activities.

What the page works out

The website combines weather conditions, holiday dates, and the child’s age to recommend suitable activities for each day.

For example, if rain is expected, it might suggest indoor water pouring or observing raindrops on a window. If a holiday is coming up, it might recommend a related activity. It also uses the temperature and weather conditions to suggest appropriate clothing and things parents should prepare.

Features

1. Weather forecast: Display a seven-day forecast based on the user’s selected city.
2. Activity recommendations: Suggest two or three age-appropriate activities each day based on the weather and upcoming holidays.
3. Clothing reminders: Recommend clothing and outdoor preparation based on temperature, rain, and other weather conditions.
4. Weekly activity calendar: Allow parents to select activities and save them to a weekly plan.
5. Activity details: Show instructions, materials needed, estimated time, and developmental benefits.

What I do not know yet

I need to figure out how to use JavaScript to fetch information from two different APIs and combine their responses using dates. I also need to learn how to create a recommendation system that matches weather conditions and holidays with activities from my own activity list.

Another challenge will be converting weather data into useful clothing suggestions instead of just displaying temperatures. Finally, I need to learn how to use localStorage to save a parent’s selected activities so their weekly plan remains available after refreshing the page.