// ==UserScript==
// @name         Filter out the dead
// @namespace    http://tampermonkey.net/
// @version      2026-03-20
// @description  try to take over the world!
// @author       You
// @match        https://neal.fun/infinite-craft/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
window.addEventListener("load", () => {
       let v_sidebar = document.querySelector("#sidebar").__vue__;
       const oldFiltered = v_sidebar._computedWatchers.filteredElements.getter;
       function filterDead(apply)
       {
	    v_sidebar._computedWatchers.filteredElements.getter = function() {
           if(apply){

		let filtered = oldFiltered.apply(this);

        filtered=filtered.filter(x=>x.text.length<=30);
        return filtered;
         }else
         {
          let filtered = oldFiltered.apply(this);
          return filtered;
         }

	}
       }








       let bar=document.querySelector(".sidebar-sorting");
       let styles = window.getComputedStyle(bar);
      // bar.style.gridTemplateColumns="1fr 1fr 40px"+" 1fr";
       let newDiv=document.createElement("span");
       let input=document.createElement("input");
       let span=document.createElement("span");
       input.style.opacity="1";
       input.style.width="20px";
       input.style.height="20px";
       input.style.marginRight="10px";
       span.style.justifyContent="flex-start";
       input.type="checkbox";
       input.style.appearance="none";
       input.type="checkbox";
       input.style.position = "relative";
       input.style.borderRadius="50%";
       input.style.border="2px solid #ccc";
       span.textContent="Hide dead items";
       newDiv.appendChild(input);
       newDiv.style.display="flex";
       newDiv.appendChild(span);
       newDiv.style.position = "relative";
       bar.appendChild(newDiv);
       const checkmark = document.createElement("div");

         checkmark.style.position = "absolute";
         checkmark.style.left = "7px";
         checkmark.style.top = "7px";

         checkmark.style.width = "8px";
         checkmark.style.height = "6px";

         checkmark.style.border = "2px solid #fff";
         checkmark.style.borderTop = "none";
         checkmark.style.borderRight = "none";

         checkmark.style.transform = "rotate(-45deg)";
         checkmark.style.opacity = "0"; // hidden by default
         checkmark.style.pointerEvents = "none"; // avoid blocking clicks

// Attach checkmark to the wrapper (NOT input)
         newDiv.appendChild(checkmark);
       input.addEventListener("change",()=>{
         if (input.checked) {
             input.style.background = "#4caf50";
             input.style.borderColor = "#4caf50";
             checkmark.style.opacity = "1";

             filterDead(true);
              let query=v_sidebar.searchQuery
              v_sidebar.searchQuery=" ";
              v_sidebar.searchQuery=query;
              //fake change of sidebar qyery

  } else {
              input.style.background = "var(--background-color)";
              input.style.borderColor = "var(--border-color)";
              checkmark.style.opacity = "0";
              filterDead(false);
              let query=v_sidebar.searchQuery
              v_sidebar.searchQuery=" ";
              v_sidebar.searchQuery=query;
              //fake change of sidebar qyery
  }
       });

   });
})();