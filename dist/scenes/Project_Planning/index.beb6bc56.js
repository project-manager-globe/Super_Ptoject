// Scroll-to-Top
let scrollToTopBtn = document.querySelector(".scrollToTopBtn");
let rootElement = document.documentElement;
function handleScroll() {
    // Do something on scroll
    let scrollTotal = rootElement.scrollHeight - rootElement.clientHeight;
    if (rootElement.scrollTop / scrollTotal > 0.4) // Show button
    scrollToTopBtn.classList.add("showBtn");
    else // Hide button
    scrollToTopBtn.classList.remove("showBtn");
}
function scrollToTop() {
    // Scroll to top logic
    rootElement.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
scrollToTopBtn.addEventListener("click", scrollToTop);
document.addEventListener("scroll", handleScroll);
{
    const MathUtils = {
        map: (x, a, b, c, d)=>(x - a) * (d - c) / (b - a) + c,
        lerp: (a, b, n)=>(1 - n) * a + n * b,
        getRandomFloat: (min, max)=>(Math.random() * (max - min) + min).toFixed(2)
    };
    const body = document.body;
    let winsize;
    const calcWinsize = ()=>winsize = {
            width: window.innerWidth,
            height: window.innerHeight
        };
    calcWinsize();
    window.addEventListener("resize", calcWinsize);
    let docScroll;
    let lastScroll;
    let scrollingSpeed = 0;
    const getPageYScroll = ()=>docScroll = window.pageYOffset || document.documentElement.scrollTop;
    window.addEventListener("scroll", getPageYScroll);
    class Item {
        constructor(el){
            // the .item element
            this.DOM = {
                el: el
            };
            this.DOM.image = this.DOM.el.querySelector(".content__item-img");
            this.DOM.imageWrapper = this.DOM.image.parentNode;
            // 3d stuff
            this.DOM.el.style.perspective = "1000px";
            this.DOM.imageWrapper.style.transformOrigin = "50% 100%";
            this.ry = MathUtils.getRandomFloat(-0.5, 0.5);
            this.rz = MathUtils.getRandomFloat(-0.5, 0.5);
            this.DOM.title = this.DOM.el.querySelector(".content__item-title");
            this.DOM.title.style.transform = "translate3d(0,0,200px)";
            this.renderedStyles = {
                // here we define which property will change as we scroll the page and the item is inside the viewport
                // in this case we will be:
                // - translating the inner image
                // - rotating the item
                // we interpolate between the previous and current value to achieve a smooth effect
                innerTranslationY: {
                    previous: 0,
                    current: 0,
                    ease: 0.1,
                    setValue: ()=>{
                        // the maximum value to translate the image is set in a CSS variable (--overflow)
                        const toValue = parseInt(getComputedStyle(this.DOM.image).getPropertyValue("--overflow"), 10);
                        const fromValue = -1 * toValue;
                        return Math.max(Math.min(MathUtils.map(this.props.top - docScroll, winsize.height, -1 * this.props.height, fromValue, toValue), toValue), fromValue);
                    }
                },
                itemRotation: {
                    previous: 0,
                    current: 0,
                    ease: 0.1,
                    toValue: Number(MathUtils.getRandomFloat(-70, -50)),
                    setValue: ()=>{
                        const toValue = this.renderedStyles.itemRotation.toValue;
                        const fromValue = toValue * -1;
                        const val = MathUtils.map(this.props.top - docScroll, winsize.height * 1.5, -1 * this.props.height, fromValue, toValue);
                        return Math.min(Math.max(val, toValue), fromValue);
                    }
                }
            };
            this.getSize();
            this.update();
            this.observer = new IntersectionObserver((entries)=>{
                entries.forEach((entry)=>this.isVisible = entry.intersectionRatio > 0);
            });
            this.observer.observe(this.DOM.el);
            this.initEvents();
        }
        update() {
            for(const key in this.renderedStyles)this.renderedStyles[key].current = this.renderedStyles[key].previous = this.renderedStyles[key].setValue();
            this.layout();
        }
        getSize() {
            const rect = this.DOM.el.getBoundingClientRect();
            this.props = {
                // item's height
                height: rect.height,
                // offset top relative to the document
                top: docScroll + rect.top
            };
        }
        initEvents() {
            window.addEventListener("resize", ()=>this.resize());
        }
        resize() {
            this.getSize();
            this.update();
        }
        render() {
            // update the current and interpolated values
            for(const key in this.renderedStyles){
                this.renderedStyles[key].current = this.renderedStyles[key].setValue();
                this.renderedStyles[key].previous = MathUtils.lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].ease);
            }
            this.layout();
        }
        layout() {
            // translates the image
            this.DOM.image.style.transform = `translate3d(0,${this.renderedStyles.innerTranslationY.previous}px,0)`;
            // rotate the image wrapper
            this.DOM.imageWrapper.style.transform = `rotate3d(1,${this.ry},${this.rz},${this.renderedStyles.itemRotation.previous}deg)`;
        }
    }
    // SmoothScroll
    class SmoothScroll {
        constructor(){
            this.DOM = {
                main: document.querySelector("main")
            };
            // the scrollable element
            // we translate this element when scrolling (y-axis)
            this.DOM.scrollable = this.DOM.main.querySelector("div[data-scroll]");
            // the items on the page
            this.items = [];
            this.DOM.content = this.DOM.main.querySelector(".content");
            [
                ...this.DOM.content.querySelectorAll(".content__item")
            ].forEach((item)=>this.items.push(new Item(item)));
            this.renderedStyles = {
                translationY: {
                    previous: 0,
                    current: 0,
                    ease: 0.1,
                    setValue: ()=>docScroll
                }
            };
            // set the body's height
            this.setSize();
            // set the initial values
            this.update();
            // the <main> element's style needs to be modified
            this.style();
            // init/bind events
            this.initEvents();
            // start the render loop
            requestAnimationFrame(()=>this.render());
        }
        update() {
            // sets the initial value (no interpolation) - translate the scroll value
            for(const key in this.renderedStyles)this.renderedStyles[key].current = this.renderedStyles[key].previous = this.renderedStyles[key].setValue();
            // translate the scrollable element
            this.layout();
        }
        layout() {
            this.DOM.scrollable.style.transform = `translate3d(0,${-1 * this.renderedStyles.translationY.previous}px,0)`;
        }
        setSize() {
            // set the heigh of the body in order to keep the scrollbar on the page
            body.style.height = `${this.DOM.scrollable.scrollHeight}px`;
        }
        style() {
            this.DOM.main.style.position = "fixed";
            this.DOM.main.style.width = this.DOM.main.style.height = "100%";
            this.DOM.main.style.top = this.DOM.main.style.left = 0;
            this.DOM.main.style.overflow = "hidden";
        }
        initEvents() {
            // on resize reset the body's height
            window.addEventListener("resize", ()=>this.setSize());
        }
        render() {
            // Get scrolling speed
            // Update lastScroll
            scrollingSpeed = Math.abs(docScroll - lastScroll);
            lastScroll = docScroll;
            // update the current and interpolated values
            for(const key in this.renderedStyles){
                this.renderedStyles[key].current = this.renderedStyles[key].setValue();
                this.renderedStyles[key].previous = MathUtils.lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].ease);
            }
            this.layout();
            // for every item
            for (const item of this.items)if (item.isVisible) {
                if (item.insideViewport) item.render();
                else {
                    item.insideViewport = true;
                    item.update();
                }
            } else item.insideViewport = false;
            requestAnimationFrame(()=>this.render());
        }
    }
    /***********************************/ /********** Preload stuff **********/ // Preload images
    const preloadImages = ()=>{
        return new Promise((resolve, reject)=>{
            imagesLoaded(document.querySelectorAll(".content__item-img"), {
                background: true
            }, resolve);
        });
    };
    preloadImages().then(()=>{
        // Remove the loader
        document.body.classList.remove("loading");
        // Get the scroll position and update the lastScroll variable
        getPageYScroll();
        lastScroll = docScroll;
        new SmoothScroll();
    });
}var refresh_button = document.querySelector("#refresh");
refresh_button.addEventListener('click', function() {
    var app = document.querySelector("#app");
    var newone = app.cloneNode(true);
    app.parentNode.replaceChild(newone, app);
}) /*$(document).ready(function() {
	var movementStrength = 50;
	var height = movementStrength / $(window).height();
	var width = movementStrength / $(window).width();
	$(".motive").mousemove(function(e){
						var pageX = e.pageX - ($(window).width() / 2);
						var pageY = e.pageY - ($(window).height() / 2);
						var newvalueX = width * pageX * -1 - 25;
						var newvalueY = height * pageY * -1 - 50;
						$('.motive').css("background-position", newvalueX+"px "+newvalueY+"px");
	});
});



	
	motive.addEventListener("mouseenter", function(e){
		console.log('mouseenter')
		var pageX = e.pageX - (width / 2);
		var pageY = e.pageY - (height / 2);
		var newvalueX = width * pageX * -1 - 25;
		var newvalueY = height * pageY * -1 - 50;
		console.log(newValue);
		motive.style.backgroundPosition = newvalueX+"px "+newvalueY+"px";		
	});	
});
*/ ;

//# sourceMappingURL=index.beb6bc56.js.map
