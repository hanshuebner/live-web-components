
describe("Selector", function() {

    var selector, selectorDriver;

    beforeEach(function() {
        // moch document root node
        document.firstChild.appendChild = function() { };

        selector = new Selector(buttonElement, {
            items: [ "one", "two", "three" ]
        }, {
            width: 100,
            height: 40,
            marginTop: 5,
            marginLeft: 5,
            marginBottom: 5,
            marginRight: 5,
            borderTopWidth: 2,
            paddingTop: 2,
            paddingLeft: 2,
            paddingBottom: 2,
            paddingRight: 2
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

        it("should do nothing is selector is disabled", function() {
            selector.setDisabled(true);
            selectorDriver.mouseDown();
            expect(selector.visibleMenu()).toBeFalsy();
        });

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

                it("should do nothing if the selector is disabled", function() {
                    selector.setDisabled(true);
                    selectorDriver.enterKey(38); // up arrow
                    expect(menu.getHighlightState()).not.toBe(selector.getState());
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
                expect(dimensioner.getMenu().height).toBe(34);

                selector.setItems([ "one", "two", "three", "long long entry" ]);
                expect(dimensioner.getMenu().width).toBe(90);
                expect(dimensioner.getMenu().height).toBe(60);
            });

        });

        describe("getState", function() {

            it("should return the state dimensions", function() {
                expect(dimensioner.getState().width).toBe(73);
                expect(dimensioner.getState().height).toBe(13);
            });

        });

        describe("getArrow", function() {

            it("should return the arrow dimensions", function() {
                expect(dimensioner.getArrow().width).toBe(9);
                expect(dimensioner.getArrow().height).toBe(9);
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
                expect(positioner.getMenu().x).toBe(4);
                expect(positioner.getMenu().y).toBe(4);
            });

            it("should place the menu upwards if window isn't height enough", function() {
                positioner._getWindowHeight = function() {
                    return 50;
                };
                expect(positioner.getMenu().top).toBe(3);
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
                    menuDriver.mouseDown(10);
                    expect(selector.getExternalValue()).toBe("one");
                    menuDriver.mouseDown(23);
                    expect(selector.getExternalValue()).toBe("two");
                    menuDriver.mouseDown(36);
                    expect(selector.getExternalValue()).toBe("three");
                });

            });

            describe("_onMouseMoveHandler", function() {

                it("should set a highlight", function() {
                    menuDriver.mouseMove(3);
                    expect(menu.hasHighlight()).toBeFalsy();

                    menuDriver.mouseMove(4);
                    expect(menu.hasHighlight()).toBeTruthy();
                });

                it("should update the highlight index", function() {
                    menuDriver.mouseMove(10);
                    expect(menu.getHighlightState()).toBe(0);
                    menuDriver.mouseMove(23);
                    expect(menu.getHighlightState()).toBe(1);
                    menuDriver.mouseMove(36);
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
