// ==UserScript==
// @name         Dead is red
// @namespace    http://tampermonkey.net/
// @version      2026-03-20
// @description  try to take over the world!
// @author       You
// @match        https://neal.fun/infinite-craft/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    function injectDeadElementStyles() {
    const css = `
        .dead-element {
            background: linear-gradient(135deg, #3a0000, #5a0000) !important;
            border: 2px solid #ff2b2b !important;;
            box-shadow: 0 0 12px rgba(255, 40, 40, 0.8) !important;;
            border-radius: 8px !important;;
            padding: 8px 12px !important;;
            color: #ffb3b3;
            transition: box-shadow 0.25s ease, transform 0.25s ease;
        }

        .dead-element:hover {
            box-shadow: 0 0 18px rgba(255, 60, 60, 1) !important;;
            transform: translateY(-2px) !important;
        }
    `;

    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
}
    'use strict';
        async function doStuffOnNode(node,rewrite=false) {
        console.log(node);
        let instanceWidth = node.offsetWidth;
        let instanceHeight = node.offsetHeight;
        node.style.height = instanceHeight.toString() + "px";
        node.style.width = instanceWidth.toString() + "px"

        {//make child and place it above elment
            var text = node.querySelector(".instance-text").textContent;

        if (text.length > 30) {
             node.classList.add("dead-element");
        } else {
             node.classList.remove("dead-element");
        }
            console.log("TEXT:" + text)
        }

    }
            async function doStuffOnItem(node,rewrite=false) {
        console.log(node);


        {//make child and place it above elment
           const textNode = Array.from(node.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
            let text=textNode.nodeValue.trim();
                  console.log("TEXT v:" + text)

        if (text.length > 30) {
             node.classList.add("dead-element");
        } else {
             node.classList.remove("dead-element");
        }
            console.log("TEXT:" + text)
        }

    }

        async function doStuffOnInstancesMutation(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {


                    if (node.id != "instance-0" && node.classList.contains("instance") && node.querySelector(".instance-emoji")) {

                        doStuffOnNode(node);
                    }
                }
            }
        }
    }
       async function doStuffOnItemMutation(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                console.log("ITEM CHECK",node)

                    if (node.classList && node.classList.contains("item-wrapper")) {
                        let itemNode=node.querySelector(".item");
                        doStuffOnItem(itemNode);
                    }
                }
            }
        }
    }
   window.addEventListener("load", async() => {
           injectDeadElementStyles() ;
           const instanceObserver = new MutationObserver((mutations) => {


            doStuffOnInstancesMutation(mutations);


        });

        instanceObserver.observe(document.getElementById("instances"), {
            childList: true,
            subtree: true,

        });
        const itemObserver = new MutationObserver((mutations) => {


            doStuffOnItemMutation(mutations);


        });

        itemObserver.observe(document.querySelector(".items"), {
            childList: true,
            subtree: true,

        });
        // do at startup om all instances
        var instances = document.querySelectorAll(".instance");
        for (let inst of instances)
            doStuffOnNode(inst,true);
        var items = document.querySelectorAll(".item");
        for (let item of items)
           doStuffOnItem(item,true);



   });


})();