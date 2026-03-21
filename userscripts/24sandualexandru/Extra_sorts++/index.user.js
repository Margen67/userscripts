// ==UserScript==
// @name         Extra_sorts++
// @namespace    http://tampermonkey.net/
// @version      2026-03-13
// @description  try to take over the world!
// @author       You
// @match        https://neal.fun/infinite-craft/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neal.fun
// @grant        unsafewindow
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener("load", () => {
       let v_sidebar = document.querySelector("#sidebar").__vue__;
      v_sidebar.sorts.push({"asc":false,"name":"Recipe Count"},{"asc":false,"name":"Usage Count"});
      const changeSort = v_sidebar.changeSort;
        v_sidebar.changeSort = function (...args) {
              setTimeout(() => {

              }, 0);
              return changeSort(...args);
          }
       const replacements = {
        "Usage%20Count.svg": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><rect x='6' y='8' width='20' height='14' rx='2' ry='2' stroke='%23444' stroke-width='2' fill='none'/><rect x='10' y='12' width='20' height='14' rx='2' ry='2' stroke='%23444' stroke-width='2' fill='none'/></svg>",
        "Recipe%20Count.svg": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><circle cx='16' cy='16' r='12' stroke='%23444' stroke-width='2' fill='none'/><path d='M10 16 L15 20 L22 12' stroke='%23444' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    };

    const observer = new MutationObserver(() => {
        document.querySelectorAll("img").forEach(img => {
            for (const key in replacements) {
                if (img.src.includes(key)) {
                    img.src = replacements[key];
                }
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    	const oldSorted = v_sidebar._computedWatchers.sortedElements.getter;
	v_sidebar._computedWatchers.sortedElements.getter = function() {
		let oldSortedElements= oldSorted.apply(this);

        if(v_sidebar.sortBy.name=="Recipe Count")
        {
          if(v_sidebar.sortBy.asc)
          oldSortedElements=oldSortedElements.sort((a, b) => (a.recipes?.length || 0) - (b.recipes?.length || 0));
         else
          oldSortedElements=oldSortedElements.sort((a, b) => (b.recipes?.length || 0) - (a.recipes?.length || 0));
        }
          if(v_sidebar.sortBy.name=="Usage Count")
        { let usages=unsafeWindow.ICHelper.usageMap;

           let compare=(a,b)=>{

               let aUsages=usages.get(a.id);
               let bUsages=usages.get(b.id);

               let aNrUsages=aUsages?.size;
               let bNrUsages=bUsages?.size;
               return (aNrUsages || 0) - (bNrUsages || 0);
           }
            if(v_sidebar.sortBy.asc)
          oldSortedElements=oldSortedElements.sort((a,b)=>compare(a,b));
         else
          oldSortedElements=oldSortedElements.sort((a, b) =>compare(b,a));
        }
        return  oldSortedElements;
	}
    });

    // Your code here...
})();