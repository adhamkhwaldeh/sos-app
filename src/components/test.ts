

function firstAvailability() {

    //First slots
    const firstPerson = ["09:00-10:30", "12:00-13:00"]
    const secondPerson = ["10:00-11:30", "12:30-14:00"]

    //First  slots
    // const firstPerson = ["11:00-11:30", "12:00-13:00"]
    // const secondPerson = ["10:00-11:30", "12:30-14:00"]

    //Second slots
    // const firstPerson = ["11:00-11:30", "12:00-13:00"]
    // const secondPerson = ["10:00-11:00", "12:30-14:00"]

    //Differnt slots 
    // const firstPerson =  ["11:00-11:30", "12:00-13:00"]
    // const secondPerson = ["10:00-11:00", "11:00-14:00"]

    //Not found
    // const firstPerson = ["11:00-11:30", "12:00-13:00"]
    // const secondPerson = ["10:00-11:00", "14:00-14:30"]

    const firstLength = firstPerson.length;
    const secondLength = secondPerson.length;
    let i = 0;
    let j = 0;

    while (i < firstLength && j < secondLength) {

        // Person A free: 9:00-10:30, 12:00-13:00
        // Person B free: "10:00-11:30", "12:30-14:00"
        const firstPointStart = firstPerson[i].split("-")[0];
        const firstPointEnd = firstPerson[i].split("-")[1];

        const secondPointStart = secondPerson[j].split("-")[0];
        const secondPointEnd = secondPerson[j].split("-")[1];

        const maxStart = firstPointStart < secondPointStart ? secondPointStart : firstPointStart;
        const minEnd = firstPointEnd > secondPointEnd ? secondPointEnd : firstPointEnd;

        // console.log(maxStart);
        // console.log(minEnd);

        if (minEnd > maxStart) {
            return maxStart;
        }

        if (firstPointEnd <= secondPointStart) {
            i++;
        }

        if (secondPointEnd <= firstPointStart) {
            j++;
        }

    }

    return "There is no availability ";
}

console.log(firstAvailability())
