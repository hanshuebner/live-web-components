
describe("Selector", function() {

    var selector, selectorDriver;

    beforeEach(function() {
        selector = new Selector(buttonElement, {
            items: [ "one", "two", "three" ]
        });
        selector.onchange = function() { };

        selectorDriver = new ControlDriver(selector);
    });

    it("should extend Control", function() {
        expect(Selector.prototype.extendClass).toBe(Control);
    });

    describe("setItems", function() {

        var items;

        beforeEach(function() {
            items = [ "one", "two" ];
        });

        it("should set the state count", function() {
            selector.setItems(items);
            expect(selector.getStateCount()).toBe(2);
        });

        it("should install a external mapping function", function() {
            selector.setItems(items);
            selector.setState(1);
            expect(selector.getExternalValue()).toBe("two")
        });

        it("should invoke a draw", function() {
            spyOn(selector, "draw");
            selector.setItems(items);
            expect(selector.draw).toHaveBeenCalled();
        });

    });

    describe("MouseHandler", function() {

        it("should set the focus on the control", function() {
            spyOn(selector.getButtonElement(), "focus")
            selectorDriver.mouseDown();
            expect(selector.getButtonElement().focus).toHaveBeenCalled();
        });

        it("should show the menu", function() {
            selectorDriver.mouseDown();
            expect(selector.visibleMenu()).toBeTruthy();
        });

    });

    describe("KeyHandler", function() {

        describe("_onKeyDownHandler", function() {

            var menu;

            beforeEach(function() {
                menu = selector._menu;
            });

            describe("with a hidden menu", function() {

                beforeEach(function() {
                    menu.hide();
                });

                it("should set the highlight index to the selected index", function() {
                    selectorDriver.enterKey(38); // up arrow
                    expect(menu.getHighlightState()).toBe(selector.getState());

                });

                it("should show the menu if up/down arrow is pressed", function() {
                    selectorDriver.enterKey(38); // up arrow
                    expect(menu.isVisible()).toBeTruthy();

                    menu.hide();

                    selectorDriver.enterKey(40); // down arrow
                    expect(menu.isVisible()).toBeTruthy();
                });

            });

            describe("with a visible menu", function() {

                beforeEach(function() {
                    selector.setState(1);
                    selectorDriver.enterKey(13); // enter
                });

                it("should increase/decrease the highlight index if up/down arrow is pressed", function() {
                    selectorDriver.enterKey(40); // down arrow
                    expect(menu.getHighlightState()).toBe(2);

                    selectorDriver.enterKey(38); // up arrow
                    expect(menu.getHighlightState()).toBe(1);
                });

                it("should set the selected index if enter is pressed", function() {
                    selectorDriver.enterKey(40); // down arrow
                    selectorDriver.enterKey(13); // enter
                    expect(selector.getState()).toBe(2);
                });

                it("should hide the menu if enter is pressed", function() {
                    selectorDriver.enterKey(13); // enter
                    expect(menu.isVisible()).toBeFalsy();
                });

            });

        });

    });

    describe("Dimensioner", function() {

        var dimensioner;

        beforeEach(function() {
            selector.setItems([ "short", "long long" ]);
            dimensioner = selector._dimensioner;
        });

        describe("getMenu", function() {

            it("should calculate the menu dimensions", function() {
                expect(dimensioner.getMenu().width).toBe(90);
                expect(dimensioner.getMenu().height).toBe(58);

                selector.setItems([ "one", "two", "three", "long long entry" ]);
                expect(dimensioner.getMenu().width).toBe(90);
                expect(dimensioner.getMenu().height).toBe(12);
            });

        });

        describe("getState", function() {

            it("should return the item dimensions", function() {
                expect(dimensioner.getState().width).toBe(73);
                expect(dimensioner.getState().height).toBe(25);
            });

        });

        describe("getArrow", function() {

            it("should return the arrow dimensions", function() {
                expect(dimensioner.getArrow().width).toBe(9);
                expect(dimensioner.getArrow().height).toBe(9);
            });

        });

        describe("getFontSize", function() {

            it("should return the calculated font size by fitting the text in", function() {
                expect(dimensioner.getFontSize()).toBe(25);
            });

            it("should return the calculated font size by using the control height", function() {
                selector.setTitle("Test");
                expect(dimensioner.getFontSize()).toBe(11);
            });

            it("should return the given font size", function() {
                dimensioner._style.fontSize = 30;
                expect(dimensioner.getFontSize()).toBe(30);
            });

        });

    });

    describe("Positioner", function() {

        var positioner;

        beforeEach(function() {
            positioner = selector._positioner;
        });

        describe("getMenu", function() {

            it("should return the menu position", function() {
                expect(positioner.getMenu().top).toBe(35);
                expect(positioner.getMenu().left).toBe(5);
            });

            it("should place the menu upwards if document isn't long enough", function() {
                positioner._getDocumentHeight = function() {
                    return 100;
                };
                expect(positioner.getMenu().top).toBe(17);
                expect(positioner.getMenu().left).toBe(5);
            });

        });

        describe("getArrow", function() {

            it("should return the arrow position", function() {
                expect(positioner.getArrow().x).toBe(82);
                expect(positioner.getArrow().y).toBe(16);
            });

        });

        describe("getState", function() {

            it("should return the selected item position", function() {
                expect(positioner.getState().x).toBe(44);
                expect(positioner.getState().y).toBe(20);
            });

        });

    });

    describe("Menu", function() {

        var menu, menuDriver;

        beforeEach(function() {
            menu = selector._menu;
            menu.show();

            menuDriver = new MenuDriver(menu);
        });

        describe("clearHighlight", function() {

            beforeEach(function() {
                menu.setHighlightState(1);
            });

            it("should set the highlight state to undefined", function() {
                menu.clearHighlightState();
                expect(menu.getHighlightState()).toBe(undefined);
                expect(menu.hasHighlight()).toBeFalsy();
            });

            it("should invoke a draw", function() {
                spyOn(menu._drawer, "drawState");
                menu.clearHighlightState();
                expect(menu._drawer.drawState).toHaveBeenCalledWith(1);
            });

        });

        describe("setHighlightIndex", function() {

            it("should set the highlight index", function() {
                menu.setHighlightState(1);
                expect(menu.getHighlightState()).toBe(1);
                expect(menu.hasHighlight()).toBeTruthy();
            });

            it("should invoke two draws", function() {
                spyOn(menu._drawer, "drawState");
                menu.setHighlightState(1);
                expect(menu._drawer.drawState).toHaveBeenCalledWith(1);
                menu.setHighlightState(0);
                expect(menu._drawer.drawState).toHaveBeenCalledWith(1);
                expect(menu._drawer.drawState).toHaveBeenCalledWith(0);
            });

        });

        describe("MouseHandler", function() {

            describe("_onMouseDownHandler", function() {

                it("should select the correct item", function() {
                    menuDriver.mouseDown(20);
                    expect(selector.getExternalValue()).toBe("one");
                    menuDriver.mouseDown(40);
                    expect(selector.getExternalValue()).toBe("two");
                    menuDriver.mouseDown(60);
                    expect(selector.getExternalValue()).toBe("three");
                });

            });

            describe("_onMouseMoveHandler", function() {

                it("should set a highlight", function() {
                    menuDriver.mouseMove(20);
                    expect(menu.hasHighlight()).toBeTruthy();
                });

                it("should update the highlight index", function() {
                    menuDriver.mouseMove(20);
                    expect(menu.getHighlightState()).toBe(0);
                    menuDriver.mouseMove(40);
                    expect(menu.getHighlightState()).toBe(1);
                    menuDriver.mouseMove(60);
                    expect(menu.getHighlightState()).toBe(2);
                });

            });

            describe("_onMouseOutHandler", function() {

                beforeEach(function() {
                    menuDriver.mouseMove(20);
                });

                it("should clear the highlight index", function() {
                    menuDriver.mouseOut();
                    expect(menu.hasHighlight()).toBeFalsy();
                });

            });

        });

    });

});
