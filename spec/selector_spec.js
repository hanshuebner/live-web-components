
describe("Selector", function() {

    var selector, selectorDriver;

    beforeEach(function() {
        selector = new Selector(buttonElement, {
            items: [ "one", "two", "three" ],
            fontSize: 26
        });
        selector.onchange = function() { };

        selectorDriver = new ControlDriver(selector);
    });

    it("should extend Control", function() {
        expect(Selector.prototype.extends).toBe(Control);
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

        describe("getMinimalWidth", function() {

            it("should calculate the minimal width", function() {
                expect(dimensioner.getMinimalWidth()).toBe(140);
                selector.setItems([ "one", "two", "three", "long long entry" ]);
                expect(dimensioner.getMinimalWidth()).toBe(204);
            });

        });

        describe("getMenu", function() {

            it("should calculate the menu dimensions", function() {
                expect(dimensioner.getMenu().width).toBe(124);
                expect(dimensioner.getMenu().height).toBe(60);

                selector.setItems([ "one", "two", "three", "long long entry" ]);
                expect(dimensioner.getMenu().width).toBe(188);
                expect(dimensioner.getMenu().height).toBe(120);
            });

        });

        describe("getBorder", function() {

            it("should calculate the border dimensions", function() {
                expect(dimensioner.getBorder().width).toBe(124);
                expect(dimensioner.getBorder().height).toBe(30);
            });

            it("should return the custiom dimensions if there are larger than the calculated one", function() {
                selector.setWidth(500);
                expect(dimensioner.getBorder().width).toBe(490);
                expect(dimensioner.getBorder().height).toBe(30);
            });

        });

        describe("getArrow", function() {

            it("should return the arrow dimensions", function() {
                expect(dimensioner.getArrow().width).toBe(13);
                expect(dimensioner.getArrow().height).toBe(13);
            });

        });

        describe("getItem", function() {

            it("should return the item dimensions", function() {
                expect(dimensioner.getItem().width).toBe(111);
                expect(dimensioner.getItem().height).toBe(30);
            });

        });

        describe("getMaximalTextWidth", function() {

            it("should return the width of the longest item", function() {
                expect(dimensioner.getMaximalTextWidth()).toBe(103);
            });

        });

        describe("getTextWidth", function() {

            it("should return the width for the given text", function() {
                expect(dimensioner.getTextWidth("test")).toBe(41);
            });

            it("should return the width for the given text base on the font size", function() {
                selector.getStyle().fontSize = 30;
                expect(dimensioner.getTextWidth("test")).toBe(48);
            });

        });

        describe("getFontSize", function() {

            it("should return the fontSize", function() {
                expect(dimensioner.getFontSize()).toBe(26);
            });

            it("should calculate the fontSize by height if not given", function() {
                dimensioner._fontSize = null;
                expect(dimensioner.getFontSize()).toBe(26);
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

        });

        describe("getBorder", function() {

            it("should return the border position", function() {
                expect(positioner.getBorder().x).toBe(5);
                expect(positioner.getBorder().y).toBe(5);
            });

        });

        describe("getArrow", function() {

            it("should return the arrow position", function() {
                expect(positioner.getArrow().x).toBe(73);
                expect(positioner.getArrow().y).toBe(13);
            });

        });

        describe("getState", function() {

            it("should return the selected item position", function() {
                expect(positioner.getState().x).toBe(38);
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

            it("should set the highlight state to undefined", function() {
                menu.clearHighlightState();
                expect(menu.getHighlightState()).toBe(undefined);
                expect(menu.hasHighlight()).toBeFalsy();
            });

            it("should invoke a draw", function() {
                spyOn(menu, "draw");
                menu.setHighlightState(1);
                expect(menu.draw).toHaveBeenCalled();
            });

        });

        describe("setHighlightIndex", function() {

            it("should set the highlight index", function() {
                menu.setHighlightState(1);
                expect(menu.getHighlightState()).toBe(1);
                expect(menu.hasHighlight()).toBeTruthy();
            });

            it("should invoke a draw", function() {
                spyOn(menu, "draw");
                menu.setHighlightState(1);
                expect(menu.draw).toHaveBeenCalled();
            });

        });

        describe("MouseHandler", function() {

            describe("_onMouseDownHandler", function() {

                it("should select the correct item", function() {
                    menuDriver.mouseDown(25);
                    expect(selector.getExternalValue()).toBe("one");
                    menuDriver.mouseDown(50);
                    expect(selector.getExternalValue()).toBe("two");
                    menuDriver.mouseDown(75);
                    expect(selector.getExternalValue()).toBe("three");
                });

            });

            describe("_onMouseMoveHandler", function() {

                it("should set a highlight", function() {
                    menuDriver.mouseMove(25);
                    expect(menu.hasHighlight()).toBeTruthy();
                });

                it("should update the highlight index", function() {
                    menuDriver.mouseMove(25);
                    expect(menu.getHighlightState()).toBe(0);
                    menuDriver.mouseMove(50);
                    expect(menu.getHighlightState()).toBe(1);
                    menuDriver.mouseMove(75);
                    expect(menu.getHighlightState()).toBe(2);
                });

            });

            describe("_onMouseOutHandler", function() {

                beforeEach(function() {
                    menuDriver.mouseMove(25);
                });

                it("should clear the highlight index", function() {
                    menuDriver.mouseOut();
                    expect(menu.hasHighlight()).toBeFalsy();
                });

            });

        });

    });

});
