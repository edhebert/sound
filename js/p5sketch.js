/* Titleist Audio Analysis Software 
 *
 * Written as a Final Project for Harvard CSCI-E3
 * Ed Hebert
 * May 2015
 * ehebert@fas.harvard edu
 *
 * This code makes use of P5.JS and P5.sound libraries
 * http://p5js.org
 */

titleistSound.factory('sketch', ['p5', function(p5) {
  return function(p) {

    // the sound audio waveform captured from the mic
    var mic;

    // the FFT analysis of the sound
    var fft;
    
    // boolean to denote whether sound has been hit
    var analyzed = false;

    // threshold of sound that constitutes a 'hit'
    var soundThreshold = 0.2;


    p.setup = function() {

        // initialize the microphone
        mic = new p5.AudioIn();
        mic.start();


        // p5.sound functions that calculate the fourier transform and amplitude of the waveform
        fft = new p5.FFT();
        fft.setInput(mic);

        p.createCanvas(p.windowWidth, p.windowHeight * 0.25);
        p.noStroke();
        // sound.play();
    };

    p.draw = function() {
        p.background(240);

        // analyze the input and save the spectrum data
        var spectrum = fft.analyze(); 
        var level = mic.getLevel();
        

        // if the current level is more than the threshold, conduct the analysis
        if (level > soundThreshold && !analyzed)
        {
          analyzeSound();
        }

        p.noFill();

        p.stroke(100,100,100); 
        p.strokeWeight(1);
        p.beginShape();
        for (var i = 0; i< spectrum.length; i++){
            p.vertex(i * 2, p.map(spectrum[i], 0, 255, p.height, 0) );
        }
        p.endShape();
    };

    var analyzeSound = function() {
        // sound has now been analyzed
        analyzed = true;

        // find maximum amplitude in a given range of frequencies
        var minFreq = 2000;
        var maxFreq = 15000;
        var freqGap = 50;

        var currentEnergy = 0;
        var peakAmplitude = 0;
        var peakFrequency = 0;

        var data = [];
        // console.log (fft);

        for (var i = minFreq; i < maxFreq; i=i + freqGap) {
            // get energy at this frequency
            currentEnergy = fft.getEnergy(i);

            // push each value as a JSON object
            data.push({
                'frequency': i, 
                'amplitude' : currentEnergy
             });

            // push the x, y values to a data array
            // data.push([i, currentEnergy]);

            if (currentEnergy > peakAmplitude) {
                // this is the new peak - assign current freq and amplitude as peaks
                peakAmplitude = currentEnergy;
                peakFrequency = i;
            }
        }
        console.log('peak frequency: ' + peakFrequency + ',  peak amplitude: ' + peakAmplitude + '\n');

        // send data to an element in the main index template (not a partial)
        document.getElementById("output").innerHTML = JSON.stringify(data);

        



        // energy in different parts of the audio spectrum (for visuals perhaps?)
        // console.log('bass: ' + fft.getEnergy('bass'));
        // console.log('lowMid: ' + fft.getEnergy('lowMid'));
        // console.log('mid: ' + fft.getEnergy('mid'));
        // console.log('highMid: ' + fft.getEnergy('highMid'));
        // console.log('treble: ' + fft.getEnergy('treble'));

        // output the file (file extension determines the save format)
        // p.saveJSON(data, 'audio-spectrum.json');

        // this is required, else the save routine will loop uncontrollably
        // return false;  

        // stop the audio 
        // mic.stop();
    }


  };
}]);