var buttons = document.getElementsByClassName('butt'),
    forEach = Array.prototype.forEach;

forEach.call(buttons, function (b) {
    b.addEventListener('click', addElement);
});

function addElement(e) { // ???
    var addDiv = document.createElement('div'),
        mValue = Math.max(this.clientWidth, this.clientHeight),
        rect = this.getBoundingClientRect();
    sDiv = addDiv.style,
        px = 'px';

    sDiv.width = sDiv.height = mValue + px;
    sDiv.left = e.clientX - rect.left - (mValue / 2) + px;
    sDiv.top = e.clientY - rect.top - (mValue / 2) + px;

    addDiv.classList.add('pulse');
    addDiv.style.zIndex = "-1"
    this.appendChild(addDiv);
}

console.log(document.getElementById('reset'))

navigator.mediaDevices.getUserMedia({audio: true})
    .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        let chunks = [] // array for binary audio

        const btnVoice = document.querySelector('#record') // definig buttons
        const btnSend = document.querySelector('#send')
        const btnPause = document.querySelector("#pause")
        const btnSkip = document.querySelector('#skip')

        let seconds = 0
        let minutes = 0
        let timer = Object.assign(document.createElement("div"), {innerHTML: `<span style="font-size: 20px">Таймер: ${minutes}:${seconds}</span>`})


        btnVoice.classList.add("start")
        btnVoice.addEventListener('click', function () {
            setTimeout(() => {
                // timer.innerHTML = "<h1>0:00</h1>"

                btnPause.classList.toggle("dp-none")
                if (btnVoice.innerHTML.includes("Запись")) {
                    try {
                        document.querySelector("#audio-block").removeChild(mainaudio)
                    } catch (e) {
                        console.log(e)
                    }
                    if (document.querySelector("#text-container").children.length === 2) {
                        document.querySelector("#text-container").appendChild(timer)
                    }
                    if (!btnSend.classList.contains("dp-none")){
                        btnSend.classList.add("dp-none")
                    }
                    seconds = 0
                    minutes = 0

                    mediaRecorder.start();
                    btnVoice.classList.replace("start", "stop")

                    btnVoice.innerHTML = "<div>Стоп</div>"
                    btnVoice.id = "stop"
                } else if (btnVoice.innerHTML.includes("Стоп")) {
                    document.querySelector("#audio-block").appendChild(mainaudio)
                    btnSend.classList.remove("dp-none")

                    mediaRecorder.stop();
                    btnVoice.classList.replace("stop", "start")

                    btnVoice.innerHTML = "<div>Запись</div>"
                    btnVoice.id = "start"

                    btnPause.innerHTML = '<div style="position: absolute; margin: 12px; max-width: 40%; display: flex; gap: 6px; justify-content: space-between"><div  class="vpalka"></div><div class="vpalka"></div></div>'
                }
            }, 300)

        });
        mediaRecorder.ondataavailable = function (event) { // writing down audio
            chunks.push(event.data);
        };

        setInterval(() => {
            if (mediaRecorder.state === "recording") {
                if (seconds === 60) {seconds = 0; minutes++} else {seconds++}
                if (seconds < 10){timer.innerHTML = `<span style="font-size: 20px">Таймер: ${minutes}:0${seconds}</span>`}
                else {timer.innerHTML = `<span style="font-size: 20px">Таймер: ${minutes}:${seconds}</span>`}
                }
            }, 1000)


        const mainaudio = new Audio; // audio player object
        mainaudio.controls = true;

        mediaRecorder.addEventListener("stop", function () {
            let blob = new Blob(chunks, {
                type: 'audio/wav'
            });
            // creates interactive element in body
            mainaudio.src = URL.createObjectURL(blob);
        });

        btnPause.addEventListener('click', function () {
            btnPause.classList.toggle("pause")
            setTimeout(() => {
                if (mediaRecorder.state === 'paused') {
                    mediaRecorder.resume()
                    btnPause.innerHTML = '<div style="position: absolute; margin: 12px; max-width: 40%; display: flex; gap: 6px; justify-content: space-between"><div  class="vpalka"></div><div class="vpalka"></div></div>'

                } else if (mediaRecorder.state === "recording") {
                    mediaRecorder.pause()
                    btnPause.innerHTML = "<div class='triangle''></div>"
                    btnPause.style.position = 'relative'
                }
            }, 300)
        })


        btnSend.addEventListener('click', function () { // sending a request with audiofile
            setTimeout(() => {
                if (minutes * 60 + seconds >= 20) {
                    let blob = new Blob(chunks, {
                        type: 'audio/wav'
                    });
                    let number = document.querySelector('#task_number')
                    let fd = new FormData();
                    fd.append('voice', blob);
                    fd.append('author', document.getElementById('account').innerHTML)
                    fd.append('cur_task', number.innerHTML)

                    sendRecord(fd).then(r => {
                        console.log("SUCCESS!")
                        console.log(fd.get('author'))
                    })

                    location.reload() // updating page to refresh text
                }
                else {
                    alert(`Длительность записи должна быть не меньше ${document.querySelector("#min_l").innerHTML} и не больше ${document.querySelector("#max_l").innerHTML} секунд!`)
                }
            }, 300)
        })

        btnSkip.addEventListener('click', function () {
            setTimeout(() => {
                if (document.querySelector(".task_text").innerHTML.includes("None")) {
                    let resetFd = new FormData()
                    resetFd.append('author', document.getElementById('account').innerHTML)

                    sendReset(resetFd).then(() => {
                        console.log("Tasks are reset")
                        location.reload()
                    })
                }
                else {
                    let number = document.querySelector('#task_number')
                    let skipFd = new FormData()

                    skipFd.append('author', document.getElementById('account').innerHTML)
                    skipFd.append('cur_task', number.innerHTML)

                    skipFd.append('skip', true)

                    sendRecord(skipFd).then((e) => {
                        console.log('Task Skipped')
                        location.reload()
                    })
                }
            }, 300)
        })
    });


async function sendRecord(record) {
    let promise = await fetch('/recording', {
        method: 'POST',
        body: record
    });
}
async function sendReset(data) {
    let promise = await fetch('/reset', {
        method: 'POST',
        body: data
    });
}



