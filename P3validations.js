const { browser } = require("protractor");

describe('PSCpageobjects', function() {
	var obj=  require("./JsObjectpage.js");
  var using=  require("jasmine-data-provider");
  var d=  require("./data.js");
  
  
  using(d.Datadrivend, function (data, description) {
		
    it("Should verify the error message when cart total is over $999.99", function() {
        var EC = protractor.ExpectedConditions;
        browser.waitForAngularEnabled(false);

        browser.sleep(8000);
    
    browser.refresh();
    browser.sleep(8000);

        obj.menudashboard.click().then(function(){
          browser.sleep(8000);
          });
        
          obj.cancel.click().then(function(){
          browser.sleep(10000);
          });
     
        obj.addcart.click().then(function(){
          browser.sleep(8000);
          
      });
      
      obj.amount.sendKeys(data.mealamount).then(function(){
          browser.sleep(1000);
          
        });
      obj.addtocartbutton.click().then(function(){
          browser.sleep(5000);
          
      });


      browser.executeScript('window.scrollTo(0,10000);').then(function (){
        obj.addfund.click().then(function(){
        browser.sleep(1000);
        });
        });
    
        
          obj.fundamount.sendKeys(data.fundamount).then(function(){
              browser.sleep(1000);
              
            });
          obj.addfundtocart.click().then(function(){
              browser.sleep(5000);
              
          });

      obj.clickoncart.click().then(function(){
          browser.sleep(5000);
          
      });
      obj.clickonselect.click().then(function(){
        browser.sleep(4000);
      });
      
      
      
      obj.continue.click().then(function(){
        browser.sleep(8000);
      });
     
      
      expect(obj.cartcheckboxtext.getText()).toContain(data.cartcheckboxtext)
obj.cartcheckboxtext.getText().then(function(text){
console.log(text);
browser.sleep(5000);
});
      
      obj.cartcheckbox.click().then(function(){
        browser.sleep(8000);
      });
     
      obj.closepopup.click().then(function(){
        browser.sleep(8000);
      });
      obj.selectall.click().then(function(){
        browser.sleep(2000);
      });
      obj.delall.click().then(function(){
        browser.sleep(8000);
      });
      expect(obj.delall.isEnabled()).toBe(true).then(function(){
        console.log("Delete is disabled");
      
      });
      browser.sleep(5000);

      obj.selectall.click().then(function(){
        browser.sleep(8000);
      });
      obj.delall.click().then(function(){
        browser.sleep(8000);
      });
      obj.yes.click().then(function(){
        browser.sleep(8000);
      });
      expect(obj.noitemsincart.getText()).toBe(data.noitemsincart)
      obj.noitemsincart.getText().then(function(text){
      console.log(text);
      browser.sleep(8000);
      });

    },250000);
  });

  using(d.Datadrivend, function (data, description) {

    it("Should verify the error message when transaction is below $5.00", function() {
        var EC = protractor.ExpectedConditions;
        browser.waitForAngularEnabled(false);


        browser.sleep(8000);

        obj.menudashboard.click().then(function(){
          browser.sleep(10000);
          
      });
      obj.cancel.click().then(function(){
        browser.sleep(15000);
        
    });
        obj.addcart.click().then(function(){
          browser.sleep(8000);
          
      });
      
      obj.amount.sendKeys(data.mealamount1).then(function(){
          browser.sleep(1000);
          
        });
      obj.addtocartbutton.click().then(function(){
          browser.sleep(5000);
          
      });


      obj.clickoncart.click().then(function(){
        browser.sleep(5000);
        
    });
    obj.clickonselect.click().then(function(){
      browser.sleep(4000);
    });
    
    
    
    obj.continue.click().then(function(){
      browser.sleep(8000);
    });

    obj.paymentcheckbox.click().then(function(){
      browser.sleep(2000);
    });
    
    obj.makepayment.click().then(function(){
      browser.sleep(15000);
    });

    expect(obj.transactionunder$5.getText()).toContain(data.transactionunder$5)
    obj.transactionunder$5.getText().then(function(text){
    console.log(text);
    browser.sleep(8000);
    });
    obj.returntocart.click().then(function(){
      browser.sleep(15000);
    });

    },200000);
  });


  using(d.Datadrivennewcard, function (data, description) {

    it("Should verify the successful transaction with new card " , function() {
        var EC = protractor.ExpectedConditions;

        browser.waitForAngularEnabled(false);

        browser.sleep(8000);

        obj.menudashboard.click().then(function(){
          browser.sleep(10000);
          
      });
      obj.cancel.click().then(function(){
        browser.sleep(15000);
        
    });
        obj.addcart.click().then(function(){
          browser.sleep(8000);
          
      });
      
      obj.amount.sendKeys(data.mealamount1).then(function(){
          browser.sleep(1000);
          
        });
      obj.addtocartbutton.click().then(function(){
          browser.sleep(5000);
          
      });

      obj.clickoncart.click().then(function(){
        browser.sleep(5000);
        
    });
    obj.clickonselect.click().then(function(){
      browser.sleep(8000);
    });

    obj.paymentmethoddropdown.click().then(function(){
      browser.sleep(8000);
      
  });
  obj.newcard.click().then(function(){
    browser.sleep(4000);
  });

  obj.continue.click().then(function(){
    browser.sleep(8000);
  });
  obj.newcardfirstname.sendKeys(data.firstname).then(function(){
    browser.sleep(5000);
    
});
obj.newcardlastname.sendKeys(data.lastname).then(function(){
  browser.sleep(4000);
});

obj.newcardnumber.sendKeys(data.cardnum).then(function(){
  browser.sleep(8000);
});
obj.newcarddate.sendKeys(data.month).then(function(){
  browser.sleep(5000);
  
});
obj.newcardcvv.sendKeys(data.CVV).then(function(){
browser.sleep(4000);
});
obj.saveforfuture.click().then(function(){
  browser.sleep(4000);
  });

  obj.cardnickname.sendKeys(data.cardnickname).then(function(){
    browser.sleep(4000);
    });

obj.submitcard.click().then(function(){
browser.sleep(8000);
});

expect(obj.makepayment.isEnabled()).toBe(false).then(function(){
  console.log("makepayment is disabled");

});

    obj.paymentcheckbox.click().then(function(){
      browser.sleep(2000);
    });
    
obj.makepayment.click().then(function(){
  browser.sleep(15000);
});
obj.rtdbutton.click().then(function(){
  browser.sleep(15000);
});

obj.cancel.click().then(function(){
  browser.sleep(15000);
});
obj.paymentmethod.click().then(function(){
  browser.sleep(8000);
});

expect(obj.newcardname.getText()).toContain(data.cardnickname)
    obj.newcardname.getText().then(function(text){
    console.log(text);
    browser.sleep(8000);
    });

  },200000);
});
 




//Fund

using(d.Datadrivend, function (data, description) {
		
  it("Should verify the error message - Sharing is not allowed on this patrons account" , function() {

    browser.sleep(8000);

      var EC = protractor.ExpectedConditions;
      browser.waitForAngularEnabled(false);

      browser.ignoreSynchronization = true;

      obj.menudashboard.click().then(function(){
        browser.sleep(10000);
        
    });
      obj.cancel.click().then(function(){	 
          browser.sleep(8000);  
      });
      
      obj.selectastudent.click().then(function(){	 
          browser.sleep(5000);  
      });
      browser.executeScript('window.scrollTo(0,10000);').then(function () {
      
            obj.norecords.getText().then(function(text){
              if(text==='No records found'){
                  browser.sleep(10000);  

               obj.allstudent.click().then(function(){
                  browser.executeScript('window.scrollTo(0,10000);'); 

                  browser.sleep(5000);  

                      obj.fundtransfericon.click().then(function(){
                        browser.sleep(4000);
                        
                      });
                      
                   
                  
                      obj.patdrop.click().then(function(){
                        browser.sleep(1000);
                        
                      });

                      expect((obj.inactivestu).isPresent()).toBe(false);

                      obj.activestu.click().then(function(){
                          browser.sleep(1000);
                          
                        });
                        obj.selectaccounttype.click().then(function(){
                          browser.sleep(1000);
                          
                        });
                        obj.selectprog.click().then(function(){
                          browser.sleep(5000);
                          
                        });
                        
                          obj.amttotrans.sendKeys(data.amounttotransfer).then(function(){
                        browser.sleep(1000);
                          });
                        
                          obj.patdrop1.click().then(function(){
                            browser.sleep(5000);
                            
                          });
                          obj.selectpat.click().then(function(){
                          browser.sleep(1000);
                            });

                            expect((obj.inactivestu).isPresent()).toBe(false);

                            
                          obj.chkboxtrans.click().then(function(){
                          browser.sleep(1000);
                           });
                        obj.transfer.click().then(function(){
                          browser.sleep(4000);
                             });
                             expect(obj.samefamily.getText()).toContain(data.Samefamily)
                             obj.samefamily.getText().then(function(text){
                             console.log(text);
                             browser.sleep(8000);
                             });
                            
                      });
                    }
               else
              console.log("Fund Transfer is allowed for Inactive patron ");
 
 
           }); 

          });


          },200000);
      });


using(d.Datadrivenfund, function (data, description) {

  it("Should verify the error message - The source and target students do not belong to the same family." , function() {
      var EC = protractor.ExpectedConditions;
      browser.waitForAngularEnabled(false);

browser.refresh();

      browser.sleep(8000);

      obj.cancel.click().then(function(){
        browser.sleep(1000);
        
      });
      
    
  browser.executeScript('window.scrollTo(0,10000);');
    browser.sleep(5000);
    obj.fundtransfericon.click().then(function(){
      browser.sleep(4000);
      
    });
    
    
    obj.patdrop.click().then(function(){
      browser.sleep(1000);
      
    });
    
    obj.differentfamilystu.click().then(function(){
      browser.sleep(1000);
      
    });
    obj.selectaccounttype.click().then(function(){
      browser.sleep(1000);
      
    });
    obj.selectprog.click().then(function(){
      browser.sleep(5000);
      
    });
    
      obj.amttotrans.sendKeys(data.amounttotransfer).then(function(){
    browser.sleep(1000);
      });
    
      
    obj.patdrop1.click().then(function(){
      browser.sleep(5000);
      
    });
      obj.selectpat.click().then(function(){
      browser.sleep(1000);
        });
        
        expect((obj.inactivepatron).isPresent()).toBe(false);
        
      obj.chkboxtrans.click().then(function(){
      browser.sleep(1000);
       });
    obj.transfer.click().then(function(){
      browser.sleep(6000);
         });
         expect(obj.differentfamily.getText()).toContain(data.differentfamily)
         obj.differentfamily.getText().then(function(text){
         console.log(text);
         browser.sleep(8000);
         });
        
  },200000);
});

















});