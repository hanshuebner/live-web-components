
describe("Spinner", function() {

    var spinner, spinnerDriver;

    beforeEach(function() {
        spinner = new Spinner(buttonElement, {
            externalMapping: {
                toDisplay: function(state) { return state; },
                fromDisplay: function(display) { return parseInt(display); }
            }
        }, {
            width: 100,
            height: 100,
            marginTop: 5,
            marginLeft: 5,
            marginBottom: 5,
            marginRight: 5,
            borderTopWidth: 0,
            paddingTop: 2,
            paddingLeft: 2,
            paddingBottom: 2,
            paddingRight: 2
        });
        spinner.onchange = function() { };

        spinnerDriver = new ControlDriver(spinner);
    });

    it("should extend Control", function() {
        expect(Spinner.prototype.extendClass).toBe(Control);
    });

    describe("blur", function() {

        it("should end value entering", function() {
            spyOn(spinner._keyHandler, "abortEntering");
            spinner.blur();
            expect(spinner._keyHandler.abortEntering).toHaveBeenCalled();
        });

    });

    describe("setState", function() {

        it("should set the state", function() {
            spinner.setState(60);
            expect(spinner.getState()).toBe(60);
        });

        it("should abort entering", function() {
            spinnerDriver.enterKey(49) // "1"
            expect(spinner._keyHandler.isEntering()).toBeTruthy();
            spinner.setState(0.8);
            expect(spinner._keyHandler.isEntering()).toBeFalsy();
        });

    });

    describe("Dimensioner", function() {

        var dimensioner;

        beforeEach(function() {
            dimensioner = spinner._dimensioner;
        });

        describe("getMarker", function() {

            it("should return the marker dimension", function() {
                expect(dimensioner.getMarker().outterRadius).toBe(43);
                expect(dimensioner.getMarker().innerRadius).toBe(37);
            });

            it("should return a smaller marker radius if a title is set", function() {
                spinner.setTitle("Test");
                expect(dimensioner.getMarker().outterRadius).toBe(37);
            });

            it("should calculate the marker radius on the space available", function() {
                spinner.setWidth(50);
                expect(dimensioner.getMarker().outterRadius).toBe(18);
            });

        });

        describe("getHighArc", function() {

            beforeEach(function() {
                spinner.setMarkerVisible(false);
            });

            it("should return the high-arc radius", function() {
                expect(dimensioner.getHighArc().radius).toBe(43);
            });

            it("should return a lower high-arc radius if the marker is visible", function() {
                spinner.setMarkerVisible(true);
                expect(dimensioner.getHighArc().radius).toBe(34);
            });

        });

        describe("getLowArc", function() {

            it("should return the high-arc radius minus the given difference", function() {
                dimensioner._style.radiusDifference = 4;
                expect(dimensioner.getLowArc().radius).toBe(30);
            });

        });

        describe("getValue", function() {

            it("should return the value dimension", function() {
                spinner.setWidth(200);
                expect(dimensioner.getValue().width).toBe(93);
                expect(dimensioner.getValue().height).toBe(43);
            });

        });

        describe("getCursor", function() {

            it("should return the cursor dimension", function() {
                expect(dimensioner.getCursor().height).toBe(14);
            });

        });

    });

    describe("Positioner", function() {

        var positioner;

        beforeEach(function() {
            positioner = spinner._positioner;
        });

        describe("getMarker", function() {

            it("should return the marker position", function() {
                expect(positioner.getMarker().x1).toBe(24);
                expect(positioner.getMarker().y1).toBe(24);
                expect(positioner.getMarker().x2).toBe(16);
                expect(positioner.getMarker().y2).toBe(24);
                expect(positioner.getMarker().x3).toBe(24);
                expect(positioner.getMarker().y3).toBe(16);
            });

        });

        describe("getHighArc", function() {

            it("should return the high-arc position", function() {
                expect(positioner.getHighArc().x).toBe(50);
                expect(positioner.getHighArc().y).toBe(50);
            });

        });

        describe("getLowArc", function() {

            it("should return the high-arc position", function() {
                expect(positioner.getLowArc().x).toBe(50);
                expect(positioner.getLowArc().y).toBe(50);
            });

        });

        describe("getValue", function() {

            it("should return the value position", function() {
                expect(positioner.getValue().x).toBe(53);
                expect(positioner.getValue().y).toBe(72);
            });

        });

        describe("getCursor", function() {

            beforeEach(function() {
                spinnerDriver.enterKey(48); // 'a'
                spinnerDriver.enterKey(49); // 'b'
            });

            it("should return the cursor position", function() {
                expect(positioner.getCursor().x).toBe(63);
                expect(positioner.getCursor().y).toBe(65);
            });

        });

        describe("getAngleForState", function() {

            it("should return PI / 2 for state 0", function() {
                expect(positioner.getAngleForState(0)).toBe(Math.PI / 2);
            });

            it("should return 5 * PI / 4 for state 50", function() {
                expect(positioner.getAngleForState(50)).toBe(5 * Math.PI / 4);
            });

            it("should return 2 * PI for state 100", function() {
                expect(positioner.getAngleForState(100)).toBe(2 * Math.PI);
            });

        });

    });

});
