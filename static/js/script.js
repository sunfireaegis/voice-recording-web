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
    this.appendChild(addDiv);
}

const account = document.createElement('p') // account name displayed
const beg = document.cookie.indexOf('=')

account.innerHTML = `Ваш аккаунт - ${document.cookie.split('uname=')[1]}`
document.querySelector('#main_body').appendChild(account)

// console.log(document.cookie.slice(beg+1))


navigator.mediaDevices.getUserMedia({audio: true})
    .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        let chunks = [] // array for binary audio

        const btnVoice = document.querySelector('#record') // definig buttons
        const btnSend = document.querySelector('#send')
        const btnPause = document.querySelector("#pause")
        const btnSkip = document.querySelector('#skip')

        btnVoice.classList.add("start")
        btnVoice.addEventListener('click', function () {
            btnPause.classList.toggle("dp-none")
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

        const mainaudio = new Audio; // audio player object
        mainaudio.controls = true;
        
        mediaRecorder.addEventListener("stop", function () {
            let blob = new Blob(chunks, {
                type: 'audio/wav'
            });
            // creates interactive element in body
            mainaudio.src = URL.createObjectURL(blob);
        });
        document.querySelector("#text-container").appendChild(mainaudio)


        btnPause.addEventListener('click', function() {
            if (mediaRecorder.state === 'paused') {
                mediaRecorder.resume()
                btnPause.innerHTML = '<div style="position: absolute; margin: 12px; max-width: 40%; display: flex; gap: 6px; justify-content: space-between"><div  class="vpalka"></div><div class="vpalka"></div></div>'

            } else if (mediaRecorder.state === "recording") {
                mediaRecorder.pause()
                btnPause.innerHTML = "<div class='triangle''></div>"
                btnPause.style.position = 'relative'
            }
        })
        


        btnSend.addEventListener('click', function() { // sending a request with audiofile
            let blob = new Blob(chunks, {
                type: 'audio/wav'
            });
            let number = document.querySelector('#task_number')


            let fd = new FormData();
            fd.append('voice', blob);
            fd.append('author', document.cookie.slice(beg+1))
            fd.append('cur_task', number.innerHTML)
            
            sendRecord(fd).then(r => {
                console.log("SUCCESS!")
                console.log(fd.get('author'))
            })

            location.reload() // updating page to refresh text
        })


        btnSkip.addEventListener('click', function() {

            let number = document.querySelector('#task_number')

            let skipFd = new FormData()

            skipFd.append('author', document.cookie.slice(beg+1))
            skipFd.append('cur_task', number.innerHTML)

            skipFd.append('skip', true)

            sendRecord(skipFd).then((e) => {
                console.log('Task Skipped')
            })
            location.reload()
        }) 

    });

async function sendRecord(record) {
    let promise = await fetch('/recording', {
        method: 'POST',
        body: record
    });
}


