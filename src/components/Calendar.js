import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import React from 'react';
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { ComposeEvent } from './ComposeEvent.js';
import { getDatabase, ref, onValue, set as firebaseSet, push as firebasePush, child } from 'firebase/database' // realtime

export function PlantCalendarPage(props) {
    // calendar locale
    const locales = {
        "en-US": require("date-fns/locale/en-US"),
    };

    const localizer = dateFnsLocalizer({
        format,
        parse,
        startOfWeek,
        getDay,
        locales,
    });

    const currentUser = props.currentUser;
    const [allEvents, setAllEvents] = useState();

    // const db = getDatabase();
    // console.log(Object.keys(allEvents).length());
    // const dummyEventRef = ref(db, 'allUsers/' + currentUser.userId + '/allEvents');
    //     firebasePush(dummyEventRef, {
    //         "title": "",
    //         "start": "",
    //         "end": ""
    //     });

    useEffect(() => {
        const db = getDatabase(); //"the database"
        const allEventsRef = ref(db, 'allUsers/' + currentUser.userId + '/allEvents');
        
        const dummyEventRef = ref(db, 'allUsers/' + currentUser.userId + '/allEvents');
        
        if (child(dummyEventRef, "dummy")) {
            firebasePush(dummyEventRef, {
                "title": "",
                "start": "",
                "end": "",
                "key": "dummy"
            });
        } 

        //returns the instructions how to turn it off
        const offFunction = onValue(allEventsRef, (snapshot) => {
            const valueObj = snapshot.val();
            const objKeys = Object.keys(valueObj);

            const objArray = objKeys.map((keyString) => {
                const theEventObject = valueObj[keyString];
                theEventObject.key = keyString;
                theEventObject.start = new Date(theEventObject.start);
                theEventObject.end = new Date(theEventObject.end);
                return theEventObject;
            })

            setAllEvents(objArray); //needs to be an array
            console.log(objArray)
        })

        //when the component goes away, we turn off the listener
        //the useEffect callback returns...
        function cleanup() {
            offFunction();
        }
        return cleanup;
    }, [])

    const addEvent = (title, start, end) => {
        const newEventDB = {
            "title": title,
            "start": start.toString(),
            "end": end.toString()
        }

        const db = getDatabase();
        const allEventsRef = ref(db, 'allUsers/' + currentUser.userId + '/allEvents');
        firebasePush(allEventsRef, newEventDB);
    }

    const handleClickDeleteEvent = (event) => {
        const db = getDatabase();
        const eventToDeleteRef = ref(db, 'allUsers/' + currentUser.userId + '/allEvents/' + event.key);
        window.alert("Warning! You are about to delete your calendar event!");
        firebaseSet(eventToDeleteRef, null);
    }

    return (
        <div className="App">
            <h1 className="calendar-title">Plant Calendar</h1>
            <ComposeEvent addEventCallback={addEvent} />
            <Calendar
                className="calendar"
                localizer={localizer}
                events={allEvents}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleClickDeleteEvent}
                defaultView="day"
                views={["month", "week", "day"]}
                style={{ height: 500 }} // Including inline styling to support 3rd party react-big-calendar library + Professor approved this
            />
            <br></br>
        </div>
    )
}