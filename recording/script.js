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
        btnVoice.addEventListener('click', function () {
            btnVoice.classList.toggle("stop")

            if (btnVoice.innerHTML.includes("Запись")) {
                mediaRecorder.start();

                btnVoice.innerHTML = "<div>Стоп</div>"
                btnVoice.id = "stop"
            } else if (btnVoice.innerHTML.includes("Стоп")) {
                mediaRecorder.stop();

                btnVoice.innerHTML = "<div>Запись</div>"
                btnVoice.id = "start"
            }
        });
        mediaRecorder.ondataavailable = function (event) { // writing down audio
            chunks.push(event.data);
        };

        mediaRecorder.addEventListener("stop", function () {
            const blob = new Blob(chunks, {
                type: 'audio/wav'
            });
            console.log(chunks)
            let fd = new FormData();
            fd.append('voice', blob);
            sendRecord(fd).then(r => {
                console.log("SUCCESS!")
            })

            // creates interactive element in body
            const mainaudio = new Audio;
            mainaudio.controls = true;
            mainaudio.src = URL.createObjectURL(blob);
            document.body.appendChild(mainaudio);

        });


    });

async function sendRecord(record) {
    let promise = await fetch('https://localhost:5000/recording', {
        method: 'POST',
        body: record
    });
}


