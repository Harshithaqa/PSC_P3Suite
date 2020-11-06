describe('PSCpageobjects', function() {
	var obj=  require("./JsObjectpage.js");
  var using=  require("jasmine-data-provider");
  var d=  require("./data.js");
  
  

  using(d.Datadrivend, function (data, description) {
    it("Should add a meal item to cart", function() {
      browser.waitForAngularEnabled(false);

      browser.sleep(5000);

        var EC = protractor.ExpectedConditions;
        obj.email.sendKeys(data.email2);
        obj.password.sendKeys(data.password1);
      obj.login.click().then(function(){
        
    
        browser.sleep(25000);
    
      });
      
    
        obj.cancel.click().then(function(){
            browser.sleep(8000);
          
            });
          
      
      
        
        obj.addcart1.click().then(function(){
          browser.sleep(8000);
          
      });
      
      obj.amount.sendKeys(data.mealamount).then(function(){
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
        browser.sleep(8000);
      });
      obj.makepayment.click().then(function(){
        browser.sleep(10000);
      });

      obj.rtdbutton.click().then(function(){
        browser.sleep(8000);
      });

    },200000);
});

using(d.Datadrivenmail, function (data, description) {
  it("Should verify the successfully transaction for meal item", function() {
//it('TS-'+description, function() {
  browser.waitForAngularEnabled(false);

 browser.ignoreSynchronization = true;
 browser.sleep(8000);

    obj.getURL4();
    browser.sleep(3000);

  
     obj.entermailid.sendKeys(data.id2).then(function(){
            browser.sleep(8000);
            }); 
    obj.viewmail.click().then(function(){
              browser.sleep(8000);
              
               }); 
               

               obj.openmail.click().then(function(){
                browser.sleep(24000);
                
                 }); 
                 browser.switchTo().frame(0);

               //  browser.switchTo().frame(element(by.xpath("//body/div[@id='root']/div[1]/section[1]/div[2]/div[1]/div[1]/div[1]/iframe[1]")).getWebElement());

                                    expect(obj.body.getText()).toContain("(Food Service)")
                                    obj.body.getText().then(function(text){
                                      console.log(text);
                                            browser.sleep(5000);
                                    });
                obj.payschool.click().then(function(){
                    browser.sleep(24000);
                                      
                        }); 
                        


         

    },250000);


      });
    });








        



















