const { browser } = require("protractor");

describe('PSCpageobjects', function() {
	var obj=  require("./JsObjectpage.js");
  var using=  require("jasmine-data-provider");
  var d=  require("./data.js");
  


  using(d.Datadrivend, function (data, description) {
    it("Should verify the functionality of Scheduled fees", function() {
  
      browser.waitForAngularEnabled(false);

        var EC = protractor.ExpectedConditions;

        browser.sleep(8000);

       obj.menudashboard.click().then(function(){
         browser.sleep(10000);
     });
        
         obj.cancel.click().then(function(){
        
          browser.sleep(9000);
         });
        
        browser.sleep(10000);

        obj.fees.click().then(function(){
            browser.sleep(10000);
          });
          
           obj.schedulefee.click().then(function(){
          
            browser.sleep(9000);
           });
          
           obj.paymentdate.click().then(function(){

            browser.sleep(9000);
           });
           obj.selectdate.click().then(function(){
          
            browser.sleep(9000);
           });
          
           obj.addschedule.click().then(function(){
          
            browser.sleep(15000);
           });
        
          
          expect((obj.scheduledfee).isPresent()).toBe(true);

        },200000);
    });

    using(d.Datadrivend, function (data, description) {
        it("Should display no fees for inactive patrons", function() {
      
          browser.waitForAngularEnabled(false);

            var EC = protractor.ExpectedConditions;
    
            browser.ignoreSynchronization = true;
            browser.sleep(5000);
      

            browser.executeScript('window.scrollTo(0,-10000);');
            browser.sleep(5000);

            obj.forwardbutton.click().then(function(){
              browser.sleep(2000);
             
             });
             obj.forwardbutton.click().then(function(){
              browser.sleep(2000);
             
             });
            obj.selectinactivestu.click().then(function(){
          
                browser.sleep(9000);
               });
            
               obj.nofeestodisplay.click().then(function(){
          
                browser.sleep(9000);
               });
            
               expect(obj.nofeestodisplay.getText()).toBe(data.nofeestodisplay)
               obj.nofeestodisplay.getText().then(function(text){
               console.log(text);
               browser.sleep(8000);
               });

               obj.logoutbutton.click().then(function(){
          
                browser.sleep(9000);
               });


},200000);
});




/*
//Meal History

using(d.Datadriven, function (data, description) {
  it('TS-'+description, function() {

             

           obj.mealmenu.click().then(function(){
            browser.sleep(6000);
            });
            obj.mealhistory.click().then(function(){
              browser.sleep(10000);
              });

         
              obj.selectmealreport.click().then(function(){
                browser.sleep(8000);
                });
    
    
                obj.selectmealactivityreport.click().then(function(){
                  browser.sleep(3000);
                  });
                 // var ECrep = protractor.ExpectedConditions;
    // Waits for the element with id 'myCheckbox' to be selected.
    //browser.wait(ECrep.elementToBeSelected($('selectstudent')), 9000);
                //  browser.executeScript('window.scrollTo(0,0);').then(function () {
                  obj.selectstu.click().then(function(){
                     browser.sleep(7000);
    
                      });
                     // obj.selectstudent.click().then(function(){
                     //browser.sleep(1000);
                     //  });
               //obj.selectstudent1.click().then(function(){
               //browser.sleep(5000);
              // browser.actions().sendKeys(protractor.Key.space).perform();
               //browser.sleep(5000);
               obj.selectstudent1.click().then(function(){
               // broswer.sleep(2000);
               
               obj.dropclose.sendKeys(protractor.Key.ESCAPE);
              
                 //browser.sendKeys(protractor.Key.ESCAPE);
               });
                //});
               // obj.clickout.click().then(function(){
                  browser.sleep(3000);
                //});
    
                obj.date.click().then(function(){
        
                  browser.sleep(4000);
                });
                obj.dateselect.click().then(function(){
                  browser.sleep(2000);
                });
                obj.createpdfbutton.click().then(function(){
                  browser.sleep(2000);
                });
                obj.sendemail.click().then(function(){
                  browser.sleep(2000);
                });
               
                obj.createpdfbutton.click().then(function(){
                  browser.sleep(4000);
                });
                obj.downloadnow.click().then(function(){
                  browser.sleep(4000);
                });
                obj.createexcel.click().then(function(){
                  browser.sleep(4000);
                });
                obj.sendemail.click().then(function(){
                  browser.sleep(4000);
                });
                
                obj.createexcel.click().then(function(){
                  browser.sleep(4000);
                });
                obj.downloadnow.click().then(function(){
                  browser.sleep(6000);
                });
    
                //browser.executeScript('window.scrollTo(0,0);').then(function () {
                //var ECacc = protractor.ExpectedConditions;
         // browser.wait(ECacc.visibilityOf( obj.selectreport.click()), 9999);
                browser.refresh();
    
                browser.sleep(8000);
    
                obj.selectmealreport.click().then(function(){
                  browser.sleep(6000);
                  });
                //});
    
                
                  obj.selectmealaccount.click().then(function(){
                    browser.sleep(3000);
                    });
                   // var ECrep = protractor.ExpectedConditions;
      // Waits for the element with id 'myCheckbox' to be selected.
      //browser.wait(ECrep.elementToBeSelected($('selectstudent')), 9000);
                  //  browser.executeScript('window.scrollTo(0,0);').then(function () {
                    obj.selectstu.click().then(function(){
                       browser.sleep(7000);
      
                        });
                       // obj.selectstudent.click().then(function(){
                       //browser.sleep(1000);
                       //  });
                 //obj.selectstudent1.click().then(function(){
                 //browser.sleep(5000);
                // browser.actions().sendKeys(protractor.Key.space).perform();
                 //browser.sleep(5000);
                 obj.selectstudent1.click().then(function(){
                 // broswer.sleep(2000);
                 
                 obj.dropclose.sendKeys(protractor.Key.ESCAPE);
                
                   //browser.sendKeys(protractor.Key.ESCAPE);
                 });
                  //});
                 // obj.clickout.click().then(function(){
                    browser.sleep(3000);
                    obj.date.click().then(function(){
                      browser.sleep(4000);
                    });
                    obj.dateselect.click().then(function(){
                      browser.sleep(2000);
                    });
    
                  //});
                  obj.createpdfbutton.click().then(function(){
                    browser.sleep(2000);
                  });
                  obj.sendemail.click().then(function(){
                    browser.sleep(2000);
                  });
                  //browser.refresh();
                  
                  //var ECclose = protractor.ExpectedConditions;
                  //browser.wait(ECclose.visibilityOf(obj.close6.click()), 9000);
                  //obj.close6.click().then(function(){
                    //browser.sleep(1000);
                  //});
                  
                  obj.createpdfbutton.click().then(function(){
                    browser.sleep(4000);
                  });
                  obj.downloadnow.click().then(function(){
                    browser.sleep(4000);
                  });
                  obj.createexcel.click().then(function(){
                    browser.sleep(4000);
                  });
                  obj.sendemail.click().then(function(){
                    browser.sleep(2000);
                  });
                  
                  obj.createexcel.click().then(function(){
                    browser.sleep(4000);
                  });
                  obj.downloadnow.click().then(function(){
                    browser.sleep(4000);
                  });
    
                },200000);
              });

 //Auto-replenishment page     

              using(d.Datadriven2, function (data, description) {
                it("Should successfully update the meals data", function() {
              
               obj.mealmenu.click().then(function(){
                browser.sleep(5000);
                
              });

obj.manageauto1.click().then(function(){
browser.sleep(5000);

});
obj.amttoadd.click().then(function(){
browser.sleep(4000);
});

obj.add30.click().then(function(){
browser.sleep(4000);
});


obj.ballevel.click().then(function(){
browser.sleep(2000);
});


obj.ten$.click().then(function(){
browser.sleep(2000);
});

obj.datepick.click().then(function(){
browser.sleep(2000);
});



obj.dateselection.click().then(function(){
browser.sleep(2000);
});
obj.paydrop.click().then(function(){
browser.sleep(2000);
});

obj.paydrop1.click().then(function(){
browser.sleep(4000);
});
obj.savebut.click().then(function(){
browser.sleep(2000);
});
obj.autocheckbox.click().then(function(){
browser.sleep(2000);
});
obj.saveauto.click().then(function(){
browser.sleep(8000);
});

expect(obj.autosuccess.getText()).toBe(data.autosuccess);
obj.autosuccess.getText().then(function(text){
console.log(text);
browser.sleep(1000);
});   

browser.executeScript('window.scrollTo(0,10000);').then(function () {
     
  obj.turnoffauto.click().then(function(){
    browser.sleep(6000);
    });
   });   

    obj.yesbutton.click().then(function(){
      browser.sleep(6000);
    });
    expect(obj.autoturnedoff.getText()).toBe(data.autoturnedoff);
    obj.autoturnedoff.getText().then(function(text){
      console.log(text);
      browser.sleep(1000);
  });


  obj.viewallhistory.click().then(function(){
    browser.sleep(6000);
    });



    expect(obj.paymenthistoryheader.getText()).toBe(data.paymenthistoryheader);
    obj.paymenthistoryheader.getText().then(function(text){
      console.log(text);
      browser.sleep(1000);
  });




},200000);

});
*/

      



});