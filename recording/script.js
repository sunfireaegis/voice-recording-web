
navigator.mediaDevices.getUserMedia({audio: true})
    .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        let chunks = [] // array for binary audio
        document.querySelector('#record').addEventListener('click', function() {
            mediaRecorder.start(); // start button
        });
        mediaRecorder.ondataavailable = function(event) { // writing down audio
            chunks.push(event.data);
        };
        document.querySelector('#stop').addEventListener('click', function() { // stopping audio
            mediaRecorder.stop(); 
        });

        mediaRecorder.addEventListener("stop", function() {
            const blob = new Blob(chunks, {
                type: 'audio/wav'
            });
            console.log(chunks)
            let fd = new FormData();
            fd.append('voice', blob);
            sendRecord(fd)

            // creates interactive element in body
            var mainaudio = new Audio;
            mainaudio.controls = true;
            mainaudio.src = URL.createObjectURL(blob);
            document.body.appendChild(mainaudio);

        });
        

    });
async function sendRecord(record) {
    let promise = await fetch('https://localhost:5000/recording', {
        method: 'POST',
        body: form});
}


