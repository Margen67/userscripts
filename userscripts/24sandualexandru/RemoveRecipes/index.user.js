// ==UserScript==
// @name         Delete Recipes on keybind
// @namespace    http://tampermonkey.net/
// @version      2026-03-07
// @description  try to take over the world!
// @author       You
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant       unsafeWindow
// ==/UserScript==

(function() {
          'use strict';
 function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
       function formatKeyEvent(e) {
        let shift = e.shiftKey ? 'Shift' : '';
        let meta = e.metaKey ? 'Meta' : '';
        let ctrl = e.ctrlKey ? 'Ctrl' : '';
        let alt = e.altKey ? 'Alt' : '';

        let arr = [ctrl,alt,shift,meta,(['Control','Shift','Alt','Meta'].some(sub => e.code.startsWith(sub)) ? '' : e.code)];

        return arr.filter((word) => word.length > 0).join(' + ');
    }
     function extractTextWithoutEmoji(el) {
    // Remove the emoji span
    const clone = el.cloneNode(true);
    const emoji = clone.querySelector("span");
    if (emoji) emoji.remove();

    // Trim leftover whitespace
    return clone.textContent.trim();
}
 function makeModal(recipes,item, action) {
    let modal = document.querySelector(".deleteRecipesModal");

    if (modal == null) {
        modal = document.createElement("div");
        modal.classList.add("deleteRecipesModal");
        modal.setAttribute("data-v-76a3fdfe", "");
        modal.style.position = "fixed";
        modal.style.top = "50%";
        modal.style.left = "50%";
        modal.style.width = "600px";
        modal.style.height = "500px";
        modal.style.maxHeight = "80vh";
        modal.style.maxWidth = "90vw";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.borderRadius = "15px";
        modal.style.border = "1px solid var(--border-color)";
        modal.style.zIndex = "1000";
        modal.style.opacity = "1";
        modal.style.background = "var(--instance-bg)";
        modal.style.display = "none";
        modal.style.overflow = "hidden"; // important: prevent whole modal from scrolling

        document.querySelector(".container").appendChild(modal);

        // Close when clicking outside
        window.addEventListener("click", (e) => {
            if (!modal.contains(e.target)) {
                modal.style.display = "none";
            }
        });
    }
    let recipeDivs=[];
    // Clear modal
    modal.innerHTML = "";

    // -------------------------
    // TITLE BAR (non-scrollable)
    // -------------------------
    const titleBar = document.createElement("div");
    titleBar.textContent = "Delete Recipes for Item: "+item.emoji+" "+item.text;
    titleBar.style.position = "sticky";
    titleBar.style.display="flex";
    titleBar.style.top = "0";
    titleBar.style.background = "var(--instance-bg)";
    titleBar.style.padding = "12px";
    titleBar.style.fontSize = "20px";
    titleBar.style.fontWeight = "bold";
    titleBar.style.borderBottom = "1px solid var(--border-color)";
    titleBar.style.zIndex = "10";
    modal.appendChild(titleBar);

     let deleteButton=document.createElement("button");
     deleteButton.textContent="Delete recipes";
     deleteButton.style.fontSize = "20px";
     deleteButton.style.marginLeft="auto";
     deleteButton.addEventListener("click", () => {
             let deleteRecipes=recipeDivs.filter(x=> {
                 let d=x[0].querySelector("input");
                 return d.checked; }
                 );
              deleteRecipes=deleteRecipes.map(x=>x[1]);
              //  modal.style.display = "none";
                action(deleteRecipes);
            });
          let deleteAllButton=document.createElement("button");
     deleteAllButton.textContent="Select all";
     deleteAllButton.style.fontSize = "20px";
     deleteAllButton.style.marginLeft="auto";
     deleteAllButton.addEventListener("click", () => {
             let deleteRecipes=recipeDivs.forEach(x=> {
                 let d=x[0].querySelector("input");
                 d.checked=true; }
                 );
              deleteRecipes=deleteRecipes.map(x=>x[1]);
              //  modal.style.display = "none";
                action(deleteRecipes);
            });
     titleBar.appendChild(deleteAllButton);
     titleBar.appendChild(deleteButton);

    // -------------------------
    // SCROLLABLE CONTENT AREA
    // -------------------------
    const content = document.createElement("div");
    content.style.overflowY = "auto";
    content.style.maxHeight = "calc(100% - 60px)";
    content.style.padding = "10px";
    modal.appendChild(content);
    content.addEventListener('wheel', (e) => {content.scrollTop += e.deltaY;
                                               e.preventDefault();
                                               e.stopImmediatePropagation();


                                              },{ passive: false, capture: true });
    // Populate recipes
    if(recipes)
    for (let recipe of recipes) {
        let parentOne = IC.getItems()[recipe[0]];
        let parentTwo = IC.getItems()[recipe[1]];

        if (parentOne && parentTwo && parentOne.emoji && parentTwo.emoji) {
            let recipeDiv = document.createElement("div");

            recipeDivs.push([recipeDiv,recipe]);
            recipeDiv.style.padding = "8px";
            recipeDiv.style.cursor = "pointer";
            recipeDiv.style.borderRadius = "8px";

            let recipeSpan = document.createElement("span");
            recipeSpan.classList.add("recipe-span");
            recipeSpan.style.whiteSpace = "nowrap";
            let deleteInput=document.createElement("input");
            deleteInput.style.opacity="1";
            deleteInput.type="checkbox";
            recipeSpan.style.display="flex";
            deleteInput.style.width="15px";
            deleteInput.style.height="15px";
            recipeSpan.style.alignItems="center";
            deleteInput.style.marginRight="20px";
            let wrapperSpan=document.createElement("span");
            wrapperSpan.style.display="inline-flex";
            wrapperSpan.appendChild(deleteInput);
            wrapperSpan.appendChild(recipeSpan);
            recipeSpan.textContent =
                parentOne.emoji + " " + parentOne.text +
                " + " +
                parentTwo.emoji + " " + parentTwo.text;

              if(parentOne.text==item.text || parentTwo.text==item.text)
            { recipeSpan.style.opacity="0.3";
            }
            else
            { recipeSpan.style.opacity = "1";
            }
            recipeDiv.appendChild(wrapperSpan);
            deleteInput.style.opacity="1";
            recipeDiv.addEventListener("click", () => {
              //  modal.style.display = "none";
                //action(recipe);
            });

            recipeDiv.addEventListener("mouseover", () => {
                let span=recipeDiv.querySelector("span.recipe-span")
                if(span.style.opacity>"0.3")
                {
                recipeDiv.style.opacity = "0.5";
                recipeDiv.style.background = "var(--instance-bg-hover)";
                }
            });

            recipeDiv.addEventListener("mouseout", () => {
                let span=recipeDiv.querySelector("span.recipe-span")
                 if(span.style.opacity>"0.3")
                 {
                recipeDiv.style.opacity = "1";
                recipeDiv.style.background = "transparent";
                 }
            });

            content.appendChild(recipeDiv);
        }
    }

    modal.style.display = "block";
}
let mouseX = 0;
let mouseY = 0;
 function createDeleteWarning(onConfirm, onCancel=null) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0,0,0,0.5)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = 999999;

    const box = document.createElement("div");
    box.style.background = "#222";
    box.style.color = "white";
    box.style.padding = "20px";
    box.style.borderRadius = "10px";
    box.style.border = "2px solid #555";
    box.style.width = "clamp(260px, 30vw, 420px)";
    box.style.fontSize = "clamp(14px, 1.2vw, 20px)";
    box.style.boxShadow = "0 0 10px rgba(0,0,0,0.4)";
    box.style.textAlign = "center";

    const msg = document.createElement("div");

    msg.textContent = "Are you sure you want to delete this recipe? This action can’t be undone, so take a moment to confirm.";
    msg.style.marginBottom = "20px";
    msg.style.lineHeight = "1.4";
    box.appendChild(msg);

    const btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.justifyContent = "space-between";
    btnRow.style.gap = "10px";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.flex = "1";
    cancelBtn.style.padding = "10px";
    cancelBtn.style.background = "#444";
    cancelBtn.style.color = "white";
    cancelBtn.style.border = "1px solid #666";
    cancelBtn.style.borderRadius = "6px";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.onclick = () => {
        overlay.remove();
        if (onCancel) onCancel();
    };

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Delete";
    confirmBtn.style.flex = "1";
    confirmBtn.style.padding = "10px";
    confirmBtn.style.background = "#b00000";
    confirmBtn.style.color = "white";
    confirmBtn.style.border = "1px solid #900";
    confirmBtn.style.borderRadius = "6px";
    confirmBtn.style.cursor = "pointer";
    confirmBtn.onclick = () => {
        overlay.remove();
        if (onConfirm) onConfirm();
    };

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);
    box.appendChild(btnRow);

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    return overlay;
}
    function openDB() {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open("infinite-craft", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains("recipes")) {
                db.createObjectStore("recipes", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
 async function deleteRecipe(recipes,item)
    {       const API = document.querySelector(".container").__vue__;
            item.recipes= item.recipes.filter(x=>recipes.find(recipe=>(x[0]==recipe[0] && x[1]==recipe[1]))==null);
            console.log("API:",API);
            var db = await openDB();
            let c= db.transaction("items","readwrite").objectStore("items");
            let d=c.get([API.currSave,item.id]);
            d.onsuccess=function()
            { let e=d.result;
             e.recipes=e.recipes.filter(x=>recipes.find(recipe=> x[0]==recipe[0] && x[1]==recipe[1])==null);
             c.put(e);
             db.close();
            }

    }
      function doStuffOnInstancesMutation(mutations) {
        for (const mutation of mutations) {
              if ( mutation.removedNodes.length > 0) {

              }
                    if (mutation.addedNodes.length > 0) {

                        for (const node of mutation.addedNodes) {


                              if(node.id!="instance-0" && node.classList.contains("instance") && node.querySelector(".instance-emoji"))
                                {
                                 let instance=IC.getInstances().find(x=>x.element==node)
                                  let item=IC.getItems().find(x=>x.text==instance.text) ;
                                   window.addEventListener("keydown",async (e)=>{
                                        let formattedKeyEvent = formatKeyEvent(e);
                                        console.log("KEY:"+formattedKeyEvent)
                                        let  rect=node.getBoundingClientRect();

                                         const isInside =
                                            mouseX >= rect.left &&
                                            mouseX <= rect.right &&
                                            mouseY >= rect.top &&
                                            mouseY <= rect.bottom;
                                            if(!isInside)
                                              return;

                                      let recipes=item?.recipes;
                                       if(formattedKeyEvent==keybind)
                                        {
                                        makeModal(recipes,item,(delete_recipes)=>{
                                           createDeleteWarning(async ()=>{
                                             deleteRecipe(delete_recipes,item);
                                           })
                                        });
                                        }
                                   });
                               }
                    }
                }
            }
        }
    let keybind=""
    //item observer:
          function doStuffOnItemsMutation(mutations) {
        let itemsDivs=document.querySelectorAll(".item:not([deleteRecipeMarked])");
           let itemsDivsArray=Array.from(itemsDivs);
                        for (const node of itemsDivsArray) {
                                node.setAttribute("deleteRecipeMarked","");
                                    let text=extractTextWithoutEmoji(node)
                                   let item=IC.getItems().find(x=>x.text==text) ;
                                   window.addEventListener("keydown",async (e)=>{
                                        let formattedKeyEvent = formatKeyEvent(e);
                                      //  console.log("KEY:"+formattedKeyEvent)
                                        let  rect=node.getBoundingClientRect();

                                         const isInside =
                                            mouseX >= rect.left &&
                                            mouseX <= rect.right &&
                                            mouseY >= rect.top &&
                                            mouseY <= rect.bottom;
                                            if(!isInside)
                                              return;


                                      let recipes=item?.recipes;
                                       if(formattedKeyEvent==keybind)
                                        {
                                        makeModal(recipes,item,(delete_recipes)=>{
                                           createDeleteWarning(async ()=>{
                                             deleteRecipe(delete_recipes,item);
                                           })
                                        });
                                        }
                                   });

                    }
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
					modal1.style.maxWidth = "700px";
					let removeRecipe_container = document.createElement("div");

					if (settings == null) {


						settings = document.querySelector(".container");
						removeRecipe_container.style.position = 'absolute';
						removeRecipe_container.style.left = '20px';
						removeRecipe_container.style.top = '100px';
						removeRecipe_container.style.width = '50px';
						removeRecipe_container.style.height = '50px';

						removeRecipe_container.classList.add('remove_recipes_settings_cont');



					}
					else {
						removeRecipe_container.classList.add('setting');
						removeRecipe_container.classList.add("modal-tab-wrapper");
						removeRecipe_container.setAttribute("data-v-525e958a", "");
						removeRecipe_container.classList.add('display_parents_settings_cont');

					}



					var title = document.createElement("div");


					title.classList.add("modal-tab");
					title.setAttribute("data-v-525e958a", "");
					var textSpacer = document.createElement("div");
					var textDiv = document.createElement("div");
					textDiv.classList.add("modal-tab-text");
					textDiv.textContent = "Delete recipes";
					textDiv.setAttribute("data-v-525e958a", "");
					textSpacer.textContent = "/";
					textSpacer.classList.add('spacer');
					textSpacer.setAttribute("data-v-525e958a", "");
					removeRecipe_container.appendChild(textSpacer);
					title.appendChild(textDiv);

					removeRecipe_container.appendChild(title);
					settings.appendChild(removeRecipe_container);
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
               localStorage.setItem("remove-recipes-keybind",val);
             });
          content.appendChild(text);
          content.appendChild(input);

       input.style.marginBottom="20px";


	});
   });
        });
    }
window.addEventListener("load",async ()=>{

 document.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});
        if(localStorage.getItem("remove-recipes-keybind"))
     {
       keybind=localStorage.getItem("remove-recipes-keybind");

     }
    async function waitForContainer() {
    while (!document.querySelector(".container")) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
    await waitForContainer();
    const API = document.querySelector(".container").__vue__;

   const addApi = API.addAPI;
  API.addAPI = async function (a,b) {
    //console.log("transactions:",this,wn)
    await addApi.apply(this);

  };


 // API.addAPI();
    set_up_settings();
  const instanceObserver = new MutationObserver((mutations) => {
                    doStuffOnInstancesMutation(mutations);
              });

                instanceObserver.observe(document.getElementById("instances"), {
                    childList: true,
                    subtree  : true,


                });
        let itemPromise=new Promise(async (r,e)=>{
          let itemsDivs=document.querySelectorAll(".item");
           let itemsDivsArray=Array.from(itemsDivs);
            while(itemsDivsArray.length<1)
            {itemsDivs=document.querySelectorAll(".item");
             itemsDivsArray=Array.from(itemsDivs);
             await sleep(100);
            }
               r();
            for(let node of itemsDivsArray){
                node.setAttribute("deleteRecipeMarked","");
                let text=extractTextWithoutEmoji(node)
                                   let item=IC.getItems().find(x=>x.text==text) ;
                                   window.addEventListener("keydown",async (e)=>{
                                        let formattedKeyEvent = formatKeyEvent(e);
                                        console.log("KEY:"+formattedKeyEvent)
                                        let  rect=node.getBoundingClientRect();

                                         const isInside =
                                            mouseX >= rect.left &&
                                            mouseX <= rect.right &&
                                            mouseY >= rect.top &&
                                            mouseY <= rect.bottom;
                                            if(!isInside)
                                              return;


                                      let recipes=item?.recipes;
                                       if(formattedKeyEvent==keybind)
                                        {
                                        makeModal(recipes,item,(delete_recipes)=>{
                                           createDeleteWarning(async ()=>{
                                             deleteRecipe(delete_recipes,item);
                                           })
                                        });
                                        }
                                   });
            }

        });

          const itemObserver = new MutationObserver((mutations) => {
                    doStuffOnItemsMutation(mutations);
              });
      let itemsDiv=document.querySelector(".items-inner");
      console.log("ITEM-DIV",itemsDiv);
               itemObserver.observe(itemsDiv, {
                    childList: true,
                    subtree  : true,
                    atributes: true

                });
});
    // Your code here...
})();