// ==UserScript==
// @name         Add Custom Collections
// @namespace    http://tampermonkey.net/
// @version      2026-03-18 v3
// @description  try to take over the world!
// @author       You
// @match        https://neal.fun/infinite-craft/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @grant         GM.getValue
// @grant         GM.setValue
// ==/UserScript==

(function() {
    'use strict';
      function sleep(ms = 0) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
function partition(arr, condition) {
  const pass = [];
  const fail = [];

  for (const item of arr) {
    (condition(item) ? pass : fail).push(item);
  }

  return [pass, fail];
}
async function w(collectionName) {
    return new Promise((resolve) => {
        GM.xmlHttpRequest({
            method: "GET",
            url: "https://infinibrowser.wiki/api/collection/elements?id=" + encodeURIComponent(collectionName),
            headers: {
                Origin: "https://infinibrowser.wiki/",
            },
            onload(response) {
                console.log("Fetch done", response.status,collectionName);

                // Handle specific error codes
                if (response.status === 400) {
                    console.warn("400 Bad Request — invalid collection name?");
                   resolve(null);
                }

                if (response.status === 404) {
                   // console.warn("404 Not Found — collection does not exist");
                    resolve(null);
                }

                if (response.status === 429) {
                   // console.warn("429 Too Many Requests — rate limited");
                    resolve(null);
                }

                // Handle any other non‑200 status
                if (response.status !== 200) {
                   // console.warn("Unexpected status:", response.status);
                     resolve(null);
                }

                // Normal success case
                if (!response.responseText) {
                     resolve(null);
                }

                resolve(response.responseText.split("").map(x => g(x)));
            },

            onerror(err) {
                console.error("Network error", err);
                resolve(null);
            },

            ontimeout() {
                console.error("Request timed out");
                resolve(null);
            }
        });
    });
}
       function g(e) {
        var t = e.split("=");
        return "G" == e[0] ? {
            type: "goal",
            text: t[0]?.slice(1),
            emoji: "❔",
            pinned: 2 == t.length
        } : {
            type: "E" == e[0] ? "element" : "custom",
            text: t[0]?.slice(1),
            emoji: t[1]?.trim().slice(0, 10) || "⬜",
            pinned: 3 == t.length
        }
    }
    function showLineageLoading() {
  // If already exists, don't recreate
  if (document.getElementById("lineage-loading")) return;

  const overlay = document.createElement("div");
  overlay.id = "lineage-loading";
  overlay.innerHTML = `
    <div class="lineage-loading-box">
      <div class="spinner"></div>
      <div class="loading-text">Wait for collection elements to load</div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Inject styles
  const style = document.createElement("style");
  style.id = "lineage-loading-style";
  style.textContent = `
    #lineage-loading {
      position: fixed;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none; /* visible but not blocking */
      background: rgba(0,0,0,0.15);
      z-index: 999999;
    }

    .lineage-loading-box {
      background: rgba(255,255,255,0.9);
      padding: 20px 30px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      text-align: center;
      pointer-events: auto; /* box itself still doesn't block clicks outside */
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 4px solid #ccc;
      border-top-color: #444;
      border-radius: 50%;
      margin: 0 auto 10px;
      animation: spinLog 0.8s linear infinite;
    }

    @keyframes spinLog {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
  `;
  document.head.appendChild(style);
}
 function hideLineageLoading() {
  document.getElementById("lineage-loading")?.remove();
  document.getElementById("lineage-loading-style")?.remove();
}
     window.addEventListener("load",async ()=>{
      let collection=[];
      let collections=[];

      let collectionName="Emoji";
      let collectionEmoji="?";

      await   new Promise((r,e)=>
                          {while(document.querySelector(".container")==null)
                           sleep(300);
                           r();
                           })
   async function loadCollection(name="emoji",emoji="?")
         {         return new Promise(async (resolve) => {
                                                 console.log("Loading...")
                                                 collectionName=name;collectionEmoji=emoji;collection=await w(name);
                                                 console.log("Phase 1 done:");
                                                  if(collection==null)
                                                      resolve();
                                                 collections.push({name:collectionName,"emoji":collectionEmoji,data:collection});

                                                 let items=document.querySelector(".container").__vue__._data.items;
                                                 const itemTexts = new Set(items.map(y => y.text));

                                                 let filtered = collections[collections.length - 1].data?.filter(x => itemTexts.has(x.text));
                                                  console.log("Phase 2 done");

                                                 const map = filtered.reduce((m, item) => {
                                                   m.set(item.text, item.emoji);
                                                   return m;
                                                 }, new Map());
                                                 console.log("Phase 3 done");
                                                 document.querySelector(".container").__vue__._data.achievementTracker.progress.set(collectionName.toLowerCase(),map)
                                                 collection.forEach(x=>{

                                                                        let list= document.querySelector(".container").__vue__._data.achievementTracker.reverseIndex.get(x.text.toLowerCase())
                                                                        document.querySelector(".container").__vue__._data.achievementTracker.reverseIndex.set(
                                                                            x.text.toLowerCase(),list!=null?[...list,{id:collectionName.toLowerCase(),canonical:x.text.toLowerCase()}]:
                                                                            [{id:collectionName.toLowerCase(),canonical:x.text.toLowerCase()}])

                                                                       })
                                                 console.log("Collection:",collection)
                                                 GM.setValue("customCollections",JSON.stringify(collections))
                                                 resolve();
         })
         }

let orginalInit=document.querySelector(".container").__vue__._data.achievementTracker.init;
document.querySelector(".container").__vue__._data.achievementTracker.init
         =function(e)
{   for(let col of collections)
    document.querySelector(".container").__vue__._data.achievementTracker.progress.set(col.name.toLowerCase(),new Map);

    orginalInit.call(this,e);
};

let orginal=document.querySelector(".container").__vue__._data.achievementTracker.getAchievements;
         document.querySelector(".container").__vue__._data.achievementTracker.getAchievements=
             function()
         { let orgList=orginal.call(this);
        for(let collection of collections)
        {
           let first=structuredClone(orgList[0]);
           let items=document.querySelector(".container").__vue__._data.items;
          first.id=collectionName.toLowerCase();
          first.name=collection.name;
          first.total=collection.data.length
          first.emoji=collection.emoji
          let map=document.querySelector(".container").__vue__._data.achievementTracker.progress.get(collection.name.toLowerCase())
          let partitionFound=partition(collection.data,(x=>(map.has(x.text) || map.has(x.text.toLowerCase()))));
          first.foundItems=partitionFound[0].map(x=>{return {name:x.text,emoji:x.emoji} });
          first.missingItems=partitionFound[1].map(x=>{return {name:x.text,emoji:x.emoji} });
          first.found=first.foundItems.length
          orgList.push(first);
          console.log("Archive:",orgList);
         }
          return orgList;
         }
         let catButton=document.querySelector(".achievements-btn");
         catButton.addEventListener("click", async ()=>{
         let modalParent=document.querySelector(".modal-wrapper");
         let modalHeader=modalParent?.querySelector(".modal-header");

            while(modalParent==null || modalHeader==null)
            { modalParent=document.querySelector(".modal-wrapper");
              modalHeader=modalParent?.querySelector(".modal-header");

             await sleep(100);
            }
             console.log("CLICCCCCCKKKKKEEEEEDDDDD");
             let closeButton=modalParent.querySelector(".modal-close");
             let hasModified=collections.filter(x=>x.state && x.state!="none")
             if(hasModified)
             {  let divUpdates=document.createElement("div")
                 for(let modified of hasModified)
                 {
                 let p=document.createElement("p");
                     if(modified.state=="deleted")
                     {   let deleteButton=document.createElement("button");
                         deleteButton.textContent="DELETE";
                         p.textContent="Collection \""+modified.name+"\" was deleted in IB or couldn't be fetched! Do you want to delete it?";
                         p.appendChild(deleteButton);
                         p.style.color="#FFC857";
                         deleteButton.addEventListener("click",function(){
                         collections=collections.filter(x=>x.name!=modified.name);
                         GM.setValue("customCollections",JSON.stringify(collections));
                                closeButton.click();
                            setTimeout(()=>{
                        catButton.click();

                             },200);
                         });
                     divUpdates.appendChild(p);
                     }
                     if(modified.state=="updated")
                     {
                        let updateButton=document.createElement("button");
                         updateButton.textContent="UPDATE";
                         p.textContent="Collection \""+modified.name+"\" was updated by "+modified.diffCount +" elements ! Do you want to update yours?";
                         p.appendChild(updateButton);
                         p.style.color="#FFC857";
                         updateButton.addEventListener("click",function(){
                         modified.data=modified.additional;
                         modified.state="none";
                         modified.additional=null;
                         GM.setValue("customCollections",JSON.stringify(collections));
                             //you need to reconstruct internal state
                               let items=document.querySelector(".container").__vue__._data.items;
                              const itemTexts = new Set(items.map(y => y.text));

                                let filtered =  modified.data
                                      .filter(x => itemTexts.has(x.text));

                                const map = filtered.reduce((m, item) => {
                                  m.set(item.text, item.emoji);
                                  return m;
                                  }, new Map());

                                document.querySelector(".container").__vue__._data.achievementTracker.progress.set(modified.name.toLowerCase(),map)
                                modified.data.forEach(x=>{

                               let list= document.querySelector(".container").__vue__._data.achievementTracker.reverseIndex.get(x.text.toLowerCase())
                               document.querySelector(".container").__vue__._data.achievementTracker.reverseIndex.set(
                               x.text.toLowerCase(),list!=null?[...list,{id:modified.name.toLowerCase(),canonical:x.text.toLowerCase()}]:
                               [{id:modified.name.toLowerCase(),canonical:x.text.toLowerCase()}])
                              });
                            closeButton.click();
                            setTimeout(()=>{
                            catButton.click();

                             },200);
                         });

                     }
                     divUpdates.appendChild(p);
                 }
              modalHeader.parentNode.insertBefore(divUpdates, modalHeader.nextSibling)
             }
             let emojiInput=document.createElement("input");
             let nameInput=document.createElement("input");
             let submitButton=document.createElement("button");
             emojiInput.style.width="60px";
             modalHeader.appendChild(emojiInput);
             modalHeader.appendChild(nameInput);
             submitButton.textContent="🔍"
             modalHeader.appendChild(submitButton);
             
             submitButton.addEventListener("click",async ()=>{
                if(nameInput.value.trim()!="")
                {   showLineageLoading();
                    let existsInCollections=collections.find(x=>x.name.toLowerCase()==nameInput.value.toLowerCase())
                    if(!existsInCollections)
                    {await loadCollection(nameInput.value,emojiInput.value.trim());
                    }else
                    {existsInCollections.emoji=emojiInput.value.trim()
                    }
                    hideLineageLoading();
                    closeButton.click();
                    setTimeout(()=>{
                        catButton.click();

                    },200);


                }

             });
         });


        // loadCollection("Emoji");
         unsafeWindow.chooseCollection=async(colName,emoji="?")=>{loadCollection(colName,emoji)}
         //now just take the collections from storage
         collections=JSON.parse((await GM.getValue("customCollections"))??"[]");
         for(let collection of collections)
         {
            let items=document.querySelector(".container").__vue__._data.items;
               const itemTexts = new Set(items.map(y => y.text));

             let filtered = collection.data
               .filter(x => itemTexts.has(x.text));

              const map = filtered.reduce((m, item) => {
                     m.set(item.text, item.emoji);
                     return m;
                    }, new Map());

              document.querySelector(".container").__vue__._data.achievementTracker.progress.set(collection.name.toLowerCase(),map)
              collection.data.forEach(x=>{

               let list= document.querySelector(".container").__vue__._data.achievementTracker.reverseIndex.get(x.text.toLowerCase())
               document.querySelector(".container").__vue__._data.achievementTracker.reverseIndex.set(
               x.text.toLowerCase(),list!=null?[...list,{id:collection.name.toLowerCase(),canonical:x.text.toLowerCase()}]:
                [{id:collection.name.toLowerCase(),canonical:x.text.toLowerCase()}])
                });

             // console.log("Value from IB",possiblyUpdated);
         }
          for(let collection of collections)
         {    collection.state="none";
           //for each custom collection fetch again
              let possiblyUpdated=await w(collection.name);
              if(possiblyUpdated==null)
              {
                  collection.state="deleted";
                  collection.additional=null;
              }else
              {  let currentData=collection.data;
                const setA = new Set(currentData.map(x=>x.text));
                const setB = new Set(possiblyUpdated.map(x=>x.text));

                const diff = [
                ...currentData.filter(x => !setB.has(x.text)),
                ...possiblyUpdated.filter(x => !setA.has(x.text))];
               console.log("DIFFERENCE:",diff);

                if(diff.length>0)
                    collection.state="updated";
                    collection.additional=possiblyUpdated
                    collection.diffCount=diff.length;
                  }
              await sleep(2000);
         }
     });




})();