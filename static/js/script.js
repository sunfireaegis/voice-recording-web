var buttons = document.getElementsByClassName('butt'), 
    forEach = Array.prototype.forEach;

forEach.call(buttons, function (b) {
    b.addEventListener('click', addElement);
});

function addElement(e) {
    var addDiv = document.createElement('div'),
        mValue = Math.max(this.clientWidth, this.clientHeight),
        rect = this.getBoundingClientRect();
    sDiv = addDiv.style,
        px = 'px';

    sDiv.width = sDiv.height = mValue + px;
    sDiv.left = e.clientX - rect.left - (mValue / 2) + px;
    sDiv.top = e.clientY - rect.top - (mValue / 2) + px;

    addDiv.classList.add('pulse');
    this.appendChild(addDiv);
}


navigator.mediaDevices.getUserMedia({audio: true})
    .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        let chunks = [] // array for binary audio

        const btnVoice = document.querySelector('#record')
        const btnSend = document.querySelector('#send')
        btnVoice.classList.add("start")

        btnVoice.addEventListener('click', function () {
            console.log(btnVoice.classList)
            if (btnVoice.innerHTML.includes("Запись")) {
                mediaRecorder.start();

                btnVoice.classList.replace("start", "stop")

                btnVoice.innerHTML = "<div>Стоп</div>"
                btnVoice.id = "stop"
            } else if (btnVoice.innerHTML.includes("Стоп")) {
                mediaRecorder.stop();
                btnVoice.classList.replace("stop", "start")

                btnVoice.innerHTML = "<div>Запись</div>"
                btnVoice.id = "start"
            }
        });
        mediaRecorder.ondataavailable = function (event) { // writing down audio
            chunks.push(event.data);
        };

        const mainaudio = new Audio;
        mainaudio.controls = true;
        
        mediaRecorder.addEventListener("stop", function () {
            let blob = new Blob(chunks, {
                type: 'audio/wav'
            });
            // creates interactive element in body
            mainaudio.src = URL.createObjectURL(blob);
        });
        document.querySelector("#text-container").appendChild(mainaudio)

        btnSend.addEventListener('click', function() {
            let blob = new Blob(chunks, {
                type: 'audio/wav'
            });
            console.log(chunks)
            let fd = new FormData();
            fd.append('voice', blob);
            sendRecord(fd).then(r => {
                console.log("SUCCESS!")
            })
        })


    });

async function sendRecord(record) {
    let promise = await fetch('/recording', {
        method: 'POST',
        body: record
    });
}


