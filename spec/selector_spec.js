
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
        expect(Selector.prototype.extends).toBe(Control);
    });

    describe("setItems", function() {

        it("should set the items", function() {
            var items = [ "one", "two" ];
            selector.setItems(items);
            expect(selector.getItems()).toBe(items);
        });

        it("should invoke a draw", function() {
            spyOn(selector, "draw");
            selector.setItems([ "one", "two" ]);
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

    describe("Dimensioner", function() {

        var dimensioner;

        beforeEach(function() {
            selector.setItems([ "short", "long long" ]);
            dimensioner = new Selector.prototype.Dimensioner(selector);
            dimensioner.setOptions({ fontSize: 26 });
        });

        describe("getMinimalWidth", function() {

            it("should calculate the minimal width", function() {
                expect(dimensioner.getMinimalWidth()).toBe(132);
                selector.setItems([ "one", "two", "three", "long long entry" ]);
                expect(dimensioner.getMinimalWidth()).toBe(193);
            });

        });

        describe("getMenu", function() {

            it("should calculate the menu dimensions", function() {
                expect(dimensioner.getMenu().width).toBe(107);
                expect(dimensioner.getMenu().height).toBe(60);

                selector.setItems([ "one", "two", "three", "long long entry" ]);
                expect(dimensioner.getMenu().width).toBe(168);
                expect(dimensioner.getMenu().height).toBe(120);
            });

        });

        describe("getBorder", function() {

            it("should calculate the border dimensions", function() {
                expect(dimensioner.getBorder().width).toBe(116);
                expect(dimensioner.getBorder().height).toBe(30);
            });

            it("should return the custiom dimensions if there are larger than the calculated one", function() {
                selector.setWidth(500);
                selector.setHeight(300);
                expect(dimensioner.getBorder().width).toBe(490);
                expect(dimensioner.getBorder().height).toBe(290);
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
                expect(dimensioner.getItem().width).toBe(103);
                expect(dimensioner.getItem().height).toBe(30);
            });

        });

        describe("getMaximalTextWidth", function() {

            it("should return the width of the longest item", function() {
                expect(dimensioner.getMaximalTextWidth()).toBe(99);
            });

        });

        describe("getTextWidth", function() {

            it("should return the width for the given text", function() {
                expect(dimensioner.getTextWidth("test")).toBe(36);
            });

            it("should return the width for the given text base on the font size", function() {
                dimensioner.setOptions({ fontSize: 30 });
                expect(dimensioner.getTextWidth("test")).toBe(41);
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

        var dimensioner, positioner;

        beforeEach(function() {
            dimensioner = new Selector.prototype.Dimensioner(selector);
            dimensioner.setOptions({ fontSize: 26 });

            positioner = new selector.Positioner(selector, dimensioner);
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
                expect(positioner.getArrow().x).toBe(64);
                expect(positioner.getArrow().y).toBe(13);
            });

        });

        describe("getSelectedItem", function() {

            it("should return the selected item position", function() {
                expect(positioner.getSelectedItem().x).toBe(34);
                expect(positioner.getSelectedItem().y).toBe(20);
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

        describe("MouseHandler", function() {

            describe("_onMouseDownHandler", function() {

                it("should select the correct item", function() {
                    menuDriver.mouseDown(25);
                    expect(selector.getSelectedItem()).toBe("one");
                    menuDriver.mouseDown(50);
                    expect(selector.getSelectedItem()).toBe("two");
                    menuDriver.mouseDown(75);
                    expect(selector.getSelectedItem()).toBe("three");
                });

            });

        });

    });

});
