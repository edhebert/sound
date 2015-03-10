/*  Titleist Acoustics Testing
    ver 0.0.1 
    3/1/2015
    Ed Hebert ed.hebert@acushnetgolf.com
*/


var appControllers = angular.module('appControllers', ['ngAnimate']);

appControllers.controller('SoundController', function($scope, p5){

    // tell Angular that the mic is on
    $scope.mic = true;
            
    $scope.mySketch = function(p) {

        // the sound audio waveform captured from the mic
        var mic;

        // the FFT analysis of the sound
        var fft;
        
        // the sound data array
        var data =[];

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

            // smooth FFT by averaging with previous samples            
            var smoothing = 0.9;

            // sound buffer to analyze between 16-1024 (a power of 2)
            // duration of buffer == (bins * 2) / 44100 
            var binCount = 1024;

            // p5.sound function that calculates frequency/amplitude of the sound sample using FFT
            fft = new p5.FFT(smoothing,binCount);

            // analyze input from the mic
            fft.setInput(mic);

            p.createCanvas(p.windowWidth, p.windowHeight * 0.25);
            p.noStroke();
            // sound.play();
        };

        p.draw = function() {
            p.background(122, 160, 175);

            var spectrum = fft.analyze(); 

            var level = mic.getLevel();
            

            // console.log(level);
            if (level > soundThreshold && !analyzed) {
              analyzeSound();
            }

            p.noFill();

            p.stroke(255); 
            p.strokeWeight(1);
            p.beginShape();
            for (var i = 0; i< spectrum.length; i++){
                // expand spectrum visually by multiplying i * 2
                p.vertex(i * 2, p.map(spectrum[i], 0, 255, p.height, 0) );
            }
            p.endShape();
        };

        var analyzeSound = function() {

            // pulse background color red 
            p.background(229, 136, 94);

            // sound has now been analyzed
            analyzed = true;
            $scope.analyzed = analyzed;

            // find maximum amplitude in a given range of frequencies
            var minFreq = 0;
            var maxFreq = 20000;
            var freqGap = 25;

            var currentEnergy = 0;
            var peakAmplitude = 0;
            var peakFrequency = 0;

            // build fft analysis array
            var dataArray = [];

            for (var i = minFreq; i < maxFreq; i=i + freqGap) {
                // get energy at this frequency
                currentEnergy = fft.getEnergy(i);

                // push each value as a JSON object
                data.push({
                    'frequency': i, 
                    'amplitude' : currentEnergy
                 });

                // push the x, y values to a data array
                dataArray.push([i, currentEnergy]);

                // var result = sound.map(function(value, index, array) {
                //     return [value.frequency, value.amplitude];
                // });

                // find the peak frequncy in the 2-5K frequency range
                if (((i >= 2000) && (i <= 5000)) && (currentEnergy > peakAmplitude)) {
                    // this is the new peak - assign current freq and amplitude as peaks
                    peakAmplitude = currentEnergy;
                    peakFrequency = i;
                }
            }

            // send data to an element in the main index template (not a partial)
            //document.getElementById("output").innerHTML = JSON.stringify(data);

            // $scope.soundData = data;

            // energy in different parts of the audio spectrum 
            // these vals are tweakable in p5.sound.js
            // this.bass = [20, 140];
            // this.lowMid = [140, 400];
            // this.mid = [400, 2600];
            // this.highMid = [2600, 5200];
            // this.treble = [5200, 14000];

            $scope.peakFrequency = peakFrequency;
            $scope.peakAmplitude = peakAmplitude;
            $scope.bass = Math.round(fft.getEnergy('bass'));
            $scope.lowMid = Math.round(fft.getEnergy('lowMid'));
            $scope.mid = Math.round(fft.getEnergy('mid'));
            $scope.highMid = Math.round(fft.getEnergy('highMid'));
            $scope.treble = Math.round(fft.getEnergy('treble'));


            // stop the audio 
            // mic.stop();

            //update the Angular scope with this data, as it doesn't bind automatically
            $scope.$apply();

            //plot the data to a highchart

            $('#highchart').highcharts({
                chart: {
                    type: 'spline',
                    zoomType: 'x',
                    height: 500
                },
                colors: [
                    '#E5885E', 
                    '#0066FF', 
                    '#00CCFF'],
                credits: {
                    enabled: false
                },
                title: {
                    text: ''
                },
                xAxis: {
                    title: {
                        text: 'Frequency'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Amplitude'
                    },
                    min: 0,
                    max: 300,
                    tickinterval: 50
                },
                series: [{
                    name: "Sound Capture",
                    data: dataArray
                }],
                exporting: {
                    enabled: true
                }
            });
        }

        $scope.resetSound = function(save) {
            if(save) {
                // output the file (file extension determines the save format)
                p.saveJSON(data, 'audio-spectrum.json', true);
            }
            // reset so that sound can be analyzed again
            $scope.analyzed = '';
            analyzed = false;
        }

        $scope.setMic = function(set) {
            if (set == 'mute') {
                mic.stop();
                $scope.mic = false;
            }
            else {
                mic.start();
                $scope.mic = true;
            }
        }

        $scope.triggerSound = function() {
            // reset so that sound can be analyzed again
            analyzeSound();
        }
    }

});

appControllers.controller('AnotherController', function($scope){

// stuff here

});


