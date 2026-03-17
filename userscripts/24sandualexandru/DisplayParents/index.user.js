// ==UserScript==
// @name        Display parent elements on keybind and lines v2
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       unsafeWindow
// @version     1.0
// @run-at		 document-start
// @author      -
// @description 7/26/2025, 10:36:13 PM
// ==/UserScript==
(function()
{
  window.addEventListener("load",()=>{
let lastCrafts=[];
let useDash=false;
let useDotted=true;
let useDouble=true;
        let tree=[];
let  useLines=true;
var lineColor="rgb(255,255,50)"
        let canvas = document.createElement("canvas");
        canvas.classList.add("Lines-canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.zIndex = "-5";
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
      window.addEventListener('resize', ()=>{
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
          if(reDrawTree)
          { reDrawTree();
          }
      });



        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        document.querySelector(".container").appendChild(canvas);
   let keybind="";
    if(localStorage.getItem("display-parents-keybind"))
     {
       keybind=localStorage.getItem("display-parents-keybind");

     }
        if(localStorage.getItem("display-parents-use-lines"))
     {
      useLines=(localStorage.getItem("display-parents-use-lines")=="true");

     }
      if(localStorage.getItem("display-parents-line-color"))
     {
      lineColor=localStorage.getItem("display-parents-line-color");

     }
    if(localStorage.getItem("display-parents-line-dotted"))
     {
      useDotted=(localStorage.getItem("display-parents-line-dotted")=="true");

     }
       if(localStorage.getItem("display-parents-line-dashed"))
     {
      useDash=(localStorage.getItem("display-parents-line-dashed")=="true");

     }
         if(localStorage.getItem("display-parents-lines-double"))
     {
      useDouble=(localStorage.getItem("display-parents-lines-double")=="true");

     }

    function makeLine(x1, y1, x2, y2, width=null,otherCanvas = null)
      {
          if(useDouble==false){
          makeLineBasic(x1,y1,x2,y2,otherCanvas)
          }else
          {   let gap=2;
              const dx = x2 - x1;
              const dy = y2 - y1;
              const len = Math.hypot(dx, dy);
              const nx = -dy / len; // unit normal vector
              const ny = dx / len;
              const ux = dx / len;
              const uy = dy / len;
              const h =1- Math.abs(uy); // 0 = vertical, 1 = horizontal

              const extraExtend = 30; // applied more when horizontal
              const extend = extraExtend;
              let v1=(uy * extend-h*2*gap);
              let v2=-uy*extend+h*2*gap;
              if(width!=null)
              { v1=Math.max(-Math.abs(width),Math.min(v1,Math.abs(width)));
                v2=Math.max(-Math.abs(width),Math.min(v2,Math.abs(width)));
              }
              let value=uy<0?v1:v2;

            // First line
              makeLineBasic(x1 + nx * gap  ,y1 + ny * gap+value,x2 + nx * gap,y2 + ny * gap- value,otherCanvas)
           // Second line

             makeLineBasic(x1 - nx * gap,y1 - ny * gap+ value,x2 - nx * gap,y2 - ny * gap- value,otherCanvas)

          }

      }


   function makeLineBasic(x1, y1, x2, y2, otherCanvas = null) {
        console.log("MAKE LINE", x1, y1, x2, y2, lineColor);
        let myCanvas = canvas;
        if (otherCanvas != null) myCanvas = otherCanvas;

        const ctx = myCanvas.getContext("2d");

        // Define a new path
        ctx.beginPath();
        // Set a start-point
        ctx.moveTo(x1, y1);

        // Set an end-point
        ctx.lineTo(x2, y2);
       if(useDash)
       {
        ctx.setLineDash([10, 5]);
       }else
       {ctx.setLineDash([]);
       }
       if(useDotted)
       {
        ctx.setLineDash([2, 6]); // small dash, big gap
        ctx.lineCap = "round";
       }
        ctx.strokeStyle = lineColor;
        // Stroke it (Do the Drawing)
        ctx.stroke();
    }

    function reDrawTree()
      {
          const ctx =canvas.getContext("2d");

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if(useLines)
          { if(tree.length>0)
          console.log("TREE UPDATED",tree);
          for(let line of tree)
          {
              makeLine(line[2],line[3],line[4],line[5],line[6],null);
          }
          }
      }
    const API = document.querySelector(".container").__vue__;

    function updateTree()
      {
          //  console.log("UPDATE TREE",tree,IC.getInstances());
             for(let line of tree)
          { //console.log("LINE",line);

           let parentInstance=IC.getInstances().find(x=>x.id==line[0]);
           let childInstance=IC.getInstances().find(x=>x.id==line[1]);
            // console.log("tree instances:",parentInstance,childInstance);
           let parentDiv=parentInstance?.element;
           let childDiv=  childInstance?.element;
           if(parentInstance!=null && childInstance!=null)
           {
            const childRect=childDiv?.getBoundingClientRect();
            const ParentRect = parentDiv?.getBoundingClientRect();
            const startX = childRect.left + childRect.width / 2;
            const startY =childRect.bottom;
            const endX = ParentRect.left + ParentRect.width / 2;
            const endY = ParentRect.top;
            const width= ParentRect.top-ParentRect.bottom;
            tree = tree.map(x => ((x[0]==line[0]) && (x[1]==line[1])) ? [line[0],line[1],startX,startY,endX,endY,width] : x);
          }else
          {
              tree=tree.filter(x=>(x[0]!=line[0]) || (x[1]!=line[1]));
          }
      }
      }
 function deleteTreeNode(id)
      {  //instead of just deleting it try to replace it with its parent
          let hasParent= tree.find(x=>x[1]==id)!=null;
          if(hasParent)
          { let parent=tree.find(x=>x[1]==id);
            let parentId=parent[0];
           //move cildren to grandparent
          tree=tree.map(x=> x[0]==id?[parentId,x[1],x[2],x[3],parent[4],parent[5],parent[6]]:x);
          tree=tree.filter(x=>x[1]!=id);
          }else
          {
          //do this only when it has no parent
          tree=tree.filter(x=>(x[0]!=id) && (x[1]!=id));
          }
      }
   const craftApi = API.craftApi;
  API.craftApi = async function (a,b) {
    const result = await craftApi.apply(this, [a, b]);
     lastCrafts.push([a,b,result]);
    //console.log("Crafts:",lastCrafts)
    return result;
  };
let mouseX = 0;
let mouseY = 0;
 document.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});
      let originalColor="";

      function makeModal(recipes,action)
      { let modal=document.querySelector(".displayParentsModal");
       if(modal==null)
       {
       modal=document.createElement("div");
       modal.classList.add("displayParentsModal");
       modal.setAttribute("data-v-76a3fdfe", "");
       modal.style.position="fixed";
       modal.style.top="50%";
       modal.style.left="50%"
       modal.style.width="600px";
       modal.style.height="500px";
       modal.style.maxHeight = "80vh";
       modal.style.maxWidth = "90vw";
       modal.style.overflowY="auto";
       modal.style.transform="translate(-50%, -50%)";
       modal.style.borderRadius="15px";
       modal.style.border=" 1px solid var(--border-color) !important";
       modal.style.zIndex="1000";
       modal.style.opacity="1";
       modal.addEventListener('wheel', (e) => {modal.scrollTop += e.deltaY;
                                               e.preventDefault();
                                               e.stopImmediatePropagation();


                                              },{ passive: false, capture: true });
      document.querySelector(".container").appendChild(modal);
       }
          window.addEventListener("click", (e) => { if (!modal.contains(e.target)) { console.log("Clicked outside modal"); modal.style.display="none"}});
          modal.style.background="var(--instance-bg)";
          modal.innerHTML="";
           for(let recipe of recipes)
           {
            let parentOne=IC.getItems()[recipe[0]]
            let parentTwo=IC.getItems()[recipe[1]]
            let recipeDiv=document.createElement("div");
            let recipeSpan=document.createElement("span");
            recipeSpan.style.whiteSpace="nowrap"
               if(parentOne && parentTwo && parentOne.emoji && parentOne.emoji)
               {
             recipeSpan.textContent=parentOne.emoji+" "+parentOne.text+" + "+parentTwo.emoji+" "+parentTwo.text
             recipeDiv.addEventListener("click",()=>{
                  modal.style.display="none"
                  action(recipe);


             });
                let originalStyle=recipeDiv.style;
                recipeDiv.addEventListener("mouseover",()=>{
                originalStyle=recipeDiv.style;
                recipeDiv.style.opacity="0.5";
                recipeDiv.style.background="var(--instance-bg-hover)"


             });
             recipeDiv.addEventListener("mouseout",()=>{
              recipeDiv.style= originalStyle;


             });


             recipeDiv.appendChild(  recipeSpan);
             modal.appendChild(recipeDiv);
               }

            }
         modal.style.display="block";
      }

   function formatKeyEvent(e) {
        let shift = e.shiftKey ? 'Shift' : '';
        let meta = e.metaKey ? 'Meta' : '';
        let ctrl = e.ctrlKey ? 'Ctrl' : '';
        let alt = e.altKey ? 'Alt' : '';

        let arr = [ctrl,alt,shift,meta,(['Control','Shift','Alt','Meta'].some(sub => e.code.startsWith(sub)) ? '' : e.code)];

        return arr.filter((word) => word.length > 0).join(' + ');
    }
	function set_up_settings() {

		let menu = document.querySelector(".menu");
		menu.addEventListener("click", () => {
			let interval = setInterval(
				() => {

					let settings = document.querySelector(".modal-tabs");
					if (settings == null)
						return;

					clearInterval(interval);

					let modal1 = document.querySelector(".modal");
					modal1.style.maxWidth = "650px";
					let displayParents_container = document.createElement("div");

					if (settings == null) {


						settings = document.querySelector(".container");
						displayParents_container.style.position = 'absolute';
						displayParents_container.style.left = '20px';
						displayParents_container.style.top = '100px';
						displayParents_container.style.width = '50px';
						displayParents_container.style.height = '50px';

						displayParents_container.classList.add('display_parents_settings_cont');



					}
					else {
						displayParents_container.classList.add('setting');
						displayParents_container.classList.add("modal-tab-wrapper");
						displayParents_container.setAttribute("data-v-525e958a", "");
						displayParents_container.classList.add('display_parents_settings_cont');

					}



					var title = document.createElement("div");


					title.classList.add("modal-tab");
					title.setAttribute("data-v-525e958a", "");
					var textSpacer = document.createElement("div");
					var textDiv = document.createElement("div");
					textDiv.classList.add("modal-tab-text");
					textDiv.textContent = "Display parents";
					textDiv.setAttribute("data-v-525e958a", "");
					textSpacer.textContent = "/";
					textSpacer.classList.add('spacer');
					textSpacer.setAttribute("data-v-525e958a", "");
					displayParents_container.appendChild(textSpacer);
					title.appendChild(textDiv);

					displayParents_container.appendChild(title);
					settings.appendChild(displayParents_container);
					var parentElement = document.querySelector(".modal");


					title.addEventListener("click", () => {

				        parentElement.children[2].style.display="none";
                        var selected=document.querySelectorAll(".modal-tab-selected");
                        selected.forEach(x=>x.classList.remove("modal-tab-selected"));
						title.classList.add("modal-tab-selected");

						var titleTabs = document.querySelector(".modal-tabs");
            var content = document.querySelector(".display-parents-setting-content");
            if (content == null) {

			          content = document.createElement("div");
			          content.setAttribute("data-v-885fff84", "");
			          content.classList.add("about");

			          content.classList.add("display-parents-setting-content");
			          parentElement.appendChild(content);

		          }else
                {
                   content.innerHTML = "";
                }

						for (let tab of titleTabs.children) {


							if (tab.querySelector(".modal-tab").querySelector(".modal-tab-text").textContent != title.textContent) {
								tab.querySelector(".modal-tab").addEventListener("click", () => {
                                  if(tab.querySelector(".modal-tab").querySelector(".modal-tab-text").textContent.trim()=="Saves" ||
                                   tab.querySelector(".modal-tab").querySelector(".modal-tab-text").textContent.trim()=="Controls" ||
                                   tab.querySelector(".modal-tab").querySelector(".modal-tab-text").textContent.trim()=="About")
                                {
                                      tab.querySelector(".modal-tab").classList.add("modal-tab-selected");
                                      parentElement.children[2].style.display="block";
                                }
									title.classList.remove("modal-tab-selected");
									if (parentElement.contains(content)) {
										parentElement.removeChild(content);
									}
								})
							}}



            //add input and text
          let text= document.createElement("p");
            text.textContent="Keybind"
          let input= document.createElement("input");
             input.value=keybind;
             input.readOnly=true;
             input.addEventListener("keydown",(e)=>{
              let val=   formatKeyEvent(e)
              console.log("VAL:"+val);
               input.value=val;
               keybind=val;
               localStorage.setItem("display-parents-keybind",val);
             });
          content.appendChild(text);
          content.appendChild(input);

       input.style.marginBottom="20px";
       let UseLinesText= document.createElement("p");
            UseLinesText.textContent="Display lines"
          let LinesInput= document.createElement("input");
             LinesInput.type="checkbox";
             LinesInput.checked=useLines;
             LinesInput.style.width="20px";
             LinesInput.style.height="20px";
             LinesInput.style.opacity="1";
             LinesInput.addEventListener("change",(e)=>{

               LinesInput.value= LinesInput.checked
               useLines=LinesInput.checked
               localStorage.setItem("display-parents-use-lines",useLines);
                 reDrawTree();
             });
            LinesInput.style.marginBottom="20px";
          content.appendChild(UseLinesText);
          content.appendChild(LinesInput);

       let ColorLinesText= document.createElement("p");
            ColorLinesText.textContent="Color lines"
          let  ColorLinesInput= document.createElement("input");
             ColorLinesInput.type="color";
             ColorLinesInput.value=lineColor;
             ColorLinesInput.addEventListener("change",(e)=>{
             lineColor=ColorLinesInput.value;
               localStorage.setItem("display-parents-line-color",lineColor);
                 reDrawTree();
             });
           ColorLinesInput.style.marginBottom="20px";
          content.appendChild(ColorLinesText);
          content.appendChild(ColorLinesInput);
         let group = document.createElement("div");
         group.id = "line-style-group";
         group.style.display = "flex";
         group.style.gap = "12px";
         group.style.marginBottom="20px";
         group.style.fontFamily = "sans-serif";
                        // Options you want
          const styles = [ { label: "Solid", value: "solid" }, { label: "Dashed", value: "dashed" }, { label: "Dotted", value: "dotted" } ];
                  // Build each radio + label
                     styles.forEach((opt, index) => { const label = document.createElement("label");
                                                     label.style.display = "flex";
                                                     label.style.alignItems = "center";
                                                     label.style.gap = "4px";
                                                     label.style.cursor = "pointer";
                                                     const radio = document.createElement("input");
                                                     radio.type = "radio";
                                                     radio.name = "lineStyle";
                                                     radio.value = opt.value;
                                                     radio.checked = false;
                                                     if (index === 0 && !useDotted && !useDash) radio.checked = true; // default
                                                     if (index === 1 && !useDotted && useDash) radio.checked = true; // default
                                                     if (index === 2 && useDotted && !useDash) radio.checked = true; // default
                                                     label.appendChild(radio);
                                                     label.appendChild(document.createTextNode(opt.label));
                                               group.appendChild(label); });

                        group.addEventListener("change", (e) => { if (e.target.name === "lineStyle") {
                            let currentStyle = e.target.value;
                            console.log("Selected:", currentStyle);
                           if(currentStyle=="solid")
                           { useDotted=false;
                             useDash=false;
                           }
                           if(currentStyle=="dashed")
                           { useDotted=false;
                             useDash=true;
                           }
                            if(currentStyle=="dotted")
                           { useDotted=true;
                             useDash=false;
                           }
                            reDrawTree();

                             localStorage.setItem("display-parents-line-dotted",useDotted);
                             localStorage.setItem("display-parents-line-dashed",useDash);

                        } });

                           content.appendChild(group);
                //double line is again a simple checkbox

         let DoubleLinesText= document.createElement("p");
            DoubleLinesText.textContent="Double lines"
          let   DoubleLinesInput= document.createElement("input");
             DoubleLinesInput.type="checkbox";
             DoubleLinesInput.type="checkbox";
             DoubleLinesInput.checked=useDouble;
              DoubleLinesInput.style.width="20px";
              DoubleLinesInput.style.height="20px";
              DoubleLinesInput.style.opacity="1";
              DoubleLinesInput.addEventListener("change",(e)=>{
               useDouble=DoubleLinesInput.checked
               localStorage.setItem("display-parents-lines-double",useDouble);
                 reDrawTree();
             });
            DoubleLinesInput.style.marginBottom="20px";
          content.appendChild(DoubleLinesText);
          content.appendChild(DoubleLinesInput);

					});
				}, 1);
		});

	}
   function helper(recipes,instance,node,rect){
        let parentOne=null;
        let parentTwo=null;
               makeModal(recipes,
                                      async (recipe)=>{

                                     console.log("RECIPE:",recipe);
                                     if(recipe)
                                       {
                                        parentOne=IC.getItems()[recipe[0]]
                                        parentTwo=IC.getItems()[recipe[1]]
                                       //order alphabetically
                                           if( parentOne.text.toLowerCase()>parentTwo.text.toLowerCase())
                                      { let temp=parentOne;
                                        parentOne=parentTwo;
                                        parentTwo=temp;
                                      }

                                       }
                                          console.log("keybounded");


                                         if(IC.getInstances().find(x=>x==instance)==null)
                                            return;


                                         if( tree.some(leaf => leaf[0] === instance.id))
                                             return;

                                          		const randoms =[rect.left,rect.top-50];


                                              let left=await IC.createInstance({
					                                    	"text": parentOne.text,
					                                    	"emoji": parentOne.emoji,
                                                  "itemId":parentOne.id,
                                                   "discovery":parentOne.discovery,
						                                        "x": node.getBoundingClientRect().left-25,
					                                        	"y": randoms[1]
				                                           	})



				                                        	let right=await IC.createInstance({
					                                      	"text": parentTwo.text,
					                                      	"emoji": parentTwo.emoji,
                                                  "itemId":parentTwo.id,
					                                        "x": node.getBoundingClientRect().right+25,
				                                        	"y": randoms[1]
				                                          	})


                                            console.log("created instances lr",left,right);

                                           const LeftRect =left.element.getBoundingClientRect();
                                           const RightRect=right.element.getBoundingClientRect();
                                           const ParentRect = node.getBoundingClientRect();
                                           const startLeftX = LeftRect.left + LeftRect.width / 2;
                                           const startLeftY = LeftRect.bottom;
                                           const startRightX = RightRect.left + RightRect.width / 2;
                                           const startRightY = RightRect.bottom;
                                           const endX = ParentRect.left + ParentRect.width / 2;
                                           const endY = ParentRect.top;
                                           const width=ParentRect.top-ParentRect.bottom;
                                           tree.push([instance.id,left.id,startLeftX,startLeftY,endX,endY,width]);
                                           tree.push([instance.id,right.id,startRightX,startRightY,endX,endY,width]);
                                           console.log("TREE",tree);

                                           makeLine(startLeftX,startLeftY,endX,endY,width,null);
                                           makeLine(startRightX,startRightY,endX,endY,width,null);
                                           node.addEventListener('mousedown', function (event) { if (event.button === 2) {
                                               deleteTreeNode(instance.id);
                                               reDrawTree();
                                            }});
                                           node.addEventListener('pointerup',function (event)
                                             { //take sidebar
                                                 let sidebar=document.querySelector("#sidebar");
                                                 let r1=sidebar.getBoundingClientRect();
                                                 let r2=node.getBoundingClientRect();
                                               if(!( r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom ))
                                               {  deleteTreeNode(instance.id);
                                                  reDrawTree();

                                               }});
                                            left.element.addEventListener('mousedown', function (event) { if (event.button === 2) {
                                              deleteTreeNode(left.id);
                                              reDrawTree();
                                            ;}
                                            });
                                            left.element.addEventListener('pointerup', function (event) {
                                               let sidebar=document.querySelector("#sidebar");
                                                 let r1=sidebar.getBoundingClientRect();
                                                 let r2= left.element.getBoundingClientRect();
                                               if(!( r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom ))
                                               {  deleteTreeNode(left.id);
                                                  reDrawTree();
                                               }
                                        });
                                            right.element.addEventListener('mousedown', function (event) { if (event.button === 2) {
                                                  deleteTreeNode(right.id);
                                                  reDrawTree();
                                                 }});
                                            right.element.addEventListener('pointerup', function (event)
                                             { //take sidebar
                                                 let sidebar=document.querySelector("#sidebar");
                                                 let r1=sidebar.getBoundingClientRect();
                                                 let r2=right.element.getBoundingClientRect();
                                               if(!( r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom ))
                                               {  deleteTreeNode(right.id);
                                                  reDrawTree();
                                               }
                                             }
                                             );

                                        });


   }

    function doStuffOnInstancesMutation(mutations) {
        for (const mutation of mutations) {
              if ( mutation.removedNodes.length > 0) {
                  updateTree();
                  reDrawTree();
              }
                    if (mutation.addedNodes.length > 0) {
                            updateTree();
                            reDrawTree();
                        for (const node of mutation.addedNodes) {


                              if(node.id!="instance-0" && node.classList.contains("instance") && node.querySelector(".instance-emoji"))
                                {
                                 let instance=IC.getInstances().find(x=>x.element==node)

                                   let parentOne=null;
                                   let parentTwo=null;
                                   let  rect=node.getBoundingClientRect();
                                    { console.log("Not crafted");
                                      let item=IC.getItems().find(x=>x.text==instance.text) ;
                                      let recipes=item?.recipes;

                                     const holdThreshold = 500; // milliseconds
                                     let holdTimer;
                                     node.addEventListener("touchstart", () => {
                                         holdTimer = setTimeout(() => { console.log("Long press detected!"); // your long-press action here
                                                                         helper(recipes,instance,node,rect);
                                                                      }, holdThreshold); });

                                     node.addEventListener("touchend", () => {
                                         clearTimeout(holdTimer); });
                                     node.addEventListener("touchmove", () => {
                                         clearTimeout(holdTimer); // cancel if finger moves
                                     });
                                     window.addEventListener("keydown",async (e)=>{
                                        let formattedKeyEvent = formatKeyEvent(e);
                                        console.log("KEY:"+formattedKeyEvent)


                                         const isInside =
                                            mouseX >= rect.left &&
                                            mouseX <= rect.right &&
                                            mouseY >= rect.top &&
                                            mouseY <= rect.bottom;
                                            if(!isInside)
                                              return;

                                       if(formattedKeyEvent==keybind)
                                        {
                                         helper(recipes,instance,node,rect);
                                        }

                                    console.log("Instance:",instance);

                                });

                        }
                    }
                }
            }
        }
    }
            let dialog=document.querySelector(".question").parentNode;
            let buttons= dialog.querySelectorAll("button");
            let yesButton=[...dialog.querySelectorAll("button")] .find(btn => btn.textContent.trim() === "Yes");
            yesButton.addEventListener("click",()=>{
                tree=[];
                reDrawTree();
            });
      if(useLines)
      {let wheelTimeout;
      window.addEventListener("wheel", (event) => {
    
                                  updateTree();
                                  reDrawTree();
             setTimeout(()=>{
                                  updateTree();
                                  reDrawTree();
                            },10);
        });
       window.addEventListener("touchmove", (event) => {
                 
                                  updateTree();
                                  reDrawTree();
             setTimeout(()=>{
                                  updateTree();
                                  reDrawTree();
                            },10);
       });
      let redraw=false;
    window.addEventListener("mousedown", (event) => {
         if (event.button === 1) {
           redraw=true;
        }
        });

     window.addEventListener("mouseup", (event) => {
         if (redraw==true) {
           redraw=false;
           updateTree();
           reDrawTree();
        }
        });
      }
          const instanceObserver = new MutationObserver((mutations) => {
                    doStuffOnInstancesMutation(mutations);
              });

                instanceObserver.observe(document.getElementById("instances"), {
                    childList: true,
                    subtree  : true,

                });
             set_up_settings();

})



})()