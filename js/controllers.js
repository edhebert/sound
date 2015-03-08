var appControllers = angular.module('appControllers', ['ngAnimate']);

appControllers.controller('SoundController', function($scope, p5){

    $scope.mySketch = function(p) {

        // the sound audio waveform captured from the mic
        var mic;

        // the FFT analysis of the sound
        var fft;
        
        // boolean to denote whether sound has been hit
        var analyzed = false;

        // threshold of sound that constitutes a 'hit'
        var soundThreshold = 0.3;

        p.preload = function() {
           // sound = p.loadSound('ball-impact.mp3');
        }

        p.setup = function() {

            // initialize the microphone
            mic = new p5.AudioIn();
            mic.start();


            
            var smoothing = 0.5;

            // sound buffer to analyze between 16-1024 (a power of 2)
            // duration of buffer == (bins * 2) / 44100 
            var binCount = 1024;

            // p5.sound function that calculates frequency/amplitude of the sound sample using FFT
            fft = new p5.FFT(smoothing,binCount);

            // analyze input from the mic
            fft.setInput(mic);

            p.createCanvas(p.windowWidth * 0.48, p.windowHeight * 0.25);
            p.noStroke();
            // sound.play();
        };

        p.draw = function() {
            p.background(249);

            var spectrum = fft.analyze(); 

            var level = mic.getLevel();
            

            // console.log(level);
            if (level > soundThreshold && !analyzed) {
              analyzeSound();
            }

            p.noFill();

            p.stroke(100,100,100); 
            p.strokeWeight(1);
            p.beginShape();
            for (var i = 0; i< spectrum.length; i++){
                // expand spectrum visually by multiplying i * 2
                p.vertex(i * 2, p.map(spectrum[i], 0, 255, p.height, 0) );
            }
            p.endShape();

            // $scope.$digest();
        };

        var analyzeSound = function() {

            // pulse background color red 
            p.background(255, 0, 0);

            // sound has now been analyzed
            // analyzed = true;

            // find maximum amplitude in a given range of frequencies
            var minFreq = 1000;
            var maxFreq = 20000;
            var freqGap = 25;

            var currentEnergy = 0;
            var peakAmplitude = 0;
            var peakFrequency = 0;

            // build fft analysis array
            var data = [];

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

            // send data to an element in the main index template (not a partial)
            //document.getElementById("output").innerHTML = JSON.stringify(data);

            $scope.soundData = data;

            // energy in different parts of the audio spectrum (for visuals perhaps?)
            $scope.peakFrequency = peakFrequency;
            $scope.peakAmplitude = peakAmplitude;
            $scope.bass = Math.round(fft.getEnergy('bass'));
            $scope.lowMid = Math.round(fft.getEnergy('lowMid'));
            $scope.mid = Math.round(fft.getEnergy('mid'));
            $scope.highMid = Math.round(fft.getEnergy('highMid'));
            $scope.treble = Math.round(fft.getEnergy('treble'));

            // output the file (file extension determines the save format)
            // p.saveJSON(data, 'audio-spectrum.json');

            // this is required, else the save routine will loop uncontrollably
            // return false;  

            // stop the audio 
            // mic.stop();

            //update the Angular scope with this data, as it doesn't bind automatically
            $scope.$apply();
        }
    }

    $scope.bio = {
        'name' : 'Ed Hebert - testing a scope variable!',
        'title': ' R&D Guy',
        'company': "Titleist"
    }

});

appControllers.controller('AnotherController', function($scope){

    $scope.address = {
        'street' : '7 Ned\'s Point'
    }

});


