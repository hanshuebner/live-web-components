
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
            dimensioner = new selector.Dimensioner(selector);
        });

        describe("getMinimalWidth", function() {

            it("should calculate the minimal width", function() {
                expect(dimensioner.getMinimalWidth()).toBe(103);
                selector.setItems([ "one", "two", "three", "long long entry" ]);
                expect(dimensioner.getMinimalWidth()).toBe(227);
            });

        });

        describe("getMenu", function() {

            it("should calculate the menu width", function() {
                expect(dimensioner.getMenu().width).toBe(93);
                selector.setItems([ "one", "two", "three", "long long entry" ]);
                expect(dimensioner.getMenu().width).toBe(217);
            });

            it("should calculate the menu height", function() {
                expect(dimensioner.getMenu().height).toBe(102);
                selector.setItems([ "one", "two", "three", "long long entry" ]);
                expect(dimensioner.getMenu().height).toBe(136);
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

                it("should hide the menu", function() {
                    menuDriver.mouseDown(25);
                    expect(menu.isVisible()).toBeFalsy();
                });

            });

        });

    });

});
