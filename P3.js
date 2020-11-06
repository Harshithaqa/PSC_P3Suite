const { browser } = require("protractor");

describe('PSCpageobjects', function() {
	var obj=  require("./JsObjectpage.js");
  var using=  require("jasmine-data-provider");
  var d=  require("./data.js");
  
  it('psc url', function() {
    var EC = protractor.ExpectedConditions;

    obj.getURL();
	
  expect (browser.getTitle()).toBe('PaySchools Central');
   

  
  },500000);


  // Invalid email in Register page
using(d.Datadrivene, function (data, description) {
    it("Registration page validation", function() {


    	  
			obj.register.click().then(function(){
				browser.sleep(1000);
			 
			   });
			  
			   obj.languagedropdown.click().then(function(){
				 browser.sleep(1000);
			 
			   });
				 
			   obj.english.click().then(function(){
				 browser.sleep(1000);
			 
			   });
				 
               obj.newemail.sendKeys(data.newemail)
               browser.sleep(4000);

               obj.fn.click();
               browser.sleep(4000);
			 
			   expect(obj.r5.getText()).toBe(data.r5);
			   obj.r5.getText().then(function(text){
				 console.log(text);
				 browser.sleep(4000);
		 
			});
				 
            obj.ln.click();
            browser.sleep(4000);


               expect(obj.r6.getText()).toBe(data.r6);
			   obj.r6.getText().then(function(text){
				 console.log(text);
				 browser.sleep(4000);
		 
			});
			  
            obj.address1.click();
            browser.sleep(4000);

              expect(obj.r7.getText()).toBe(data.r7);
              obj.r7.getText().then(function(text){
                console.log(text);
                browser.sleep(4000);
        
           });

           obj.address2.click();
			   
           browser.sleep(4000);
                      
           obj.postalcode.click();
           
			   expect(obj.r8.getText()).toBe(data.r8);
			   obj.r8.getText().then(function(text){
				 console.log(text);
                 browser.sleep(4000);
		 
			});
			  
            obj.city.click();
            browser.sleep(4000);
			 
               expect(obj.r9.getText()).toBe(data.r9);
			   obj.r9.getText().then(function(text){
				 console.log(text);
                 browser.sleep(4000);
		 
			});

			      
            obj.statedropdown.click().then(function(){
              
                obj.statedropdown.sendKeys(protractor.Key.ESCAPE);
            
              }); 
              
          
              browser.sleep(4000);

			   expect(obj.r10.getText()).toBe(data.r10);
			   obj.r10.getText().then(function(text){
				 console.log(text);
                 browser.sleep(4000);
		 
			});
            expect(obj.r11.getText()).toBe(data.r11);
            obj.r11.getText().then(function(text){
              console.log(text);
              browser.sleep(4000);
      
         });
        

        },200000);
      });

        using(d.Datadrivenregister, function (data, description) {
	it("Registraction page validation - User already exists", function() {

        obj.newemail.clear().then(function(){
            browser.sleep(4000);
        });
	  obj.newemail.sendKeys(data.newemail)
      browser.sleep(2000);

	  obj.fn.sendKeys(data.fn)
      browser.sleep(2000);

	 obj.ln.sendKeys(data.ln);
     browser.sleep(2000);

	  obj.address1.sendKeys(data.address1);
      browser.sleep(2000);

	  obj.address2.sendKeys(data.address2);
      browser.sleep(2000);

	  obj.postalcode.sendKeys(data.postalcode);
      browser.sleep(2000);

	  obj.city.sendKeys(data.city)
      browser.sleep(2000);

	  obj.statedropdown.click().then(function(){
		browser.sleep(2000);
	
	  }); 
	  
	  obj.stateselection.click().then(function(){
        browser.sleep(5000);
	
		
    }); 
    
    obj.ch0.click().then(function(){
      browser.sleep(1000);
    
      }); 
    
    obj.registerbutton.click().then(function(){
      browser.sleep(2000);
     
        });
     expect(obj.useralreadyexists.getText()).toContain(data.useralreadyexists);
      obj.useralreadyexists.getText().then(function(text){
      console.log(text);
      browser.sleep(8000);
      
      });
      
    //  browser.executeScript('window.scrollTo(0,10000);');

      obj.ph.sendKeys(data.ph6)
      browser.sleep(4000);

      obj.mb.sendKeys(data.mb6)
      browser.sleep(2000);

    
	obj.registerbutton.click().then(function(){
	 browser.sleep(2000);
	
	 });
          expect(obj.r12.getText()).toBe(data.r12);
         obj.r12.getText().then(function(text){
           console.log(text);
           browser.sleep(6000);
   
      });	
          
      
},250000);	
	});	

 //forgot password - invalid email
 using(d.Datadrivenm, function (data, description) {
    it("Forgot password page valdiations", function() {
      browser.sleep(6000);

	 browser.refresh();
    	     browser.sleep(3000);
    	     
	  
			obj.forpass.click().then(function(){
				browser.sleep(1000);
			 
			   });
			   
			  		 
			   obj.ema.sendKeys(data.ema);
			   obj.respass.click().then(function(){
				browser.sleep(1000);
			   });
						  			   
			   var EC11 = protractor.ExpectedConditions;
			   browser.wait(EC11.visibilityOf(obj.r13), 9999);
			   
			   expect(obj.r13.getText()).toBe(data.r13);
			   obj.r13.getText().then(function(text){
				 console.log(text);
				 browser.sleep(1000);
		 
			});
    },200000);	


//forgot password - phonenotmapped

    it("Forgot password page valdiations for invalid phone number", function() {


             browser.sleep(3000);
             
             obj.ema.clear().then(function(){
                browser.sleep(5000);
            });
    
                       
               obj.ema.sendKeys(data.ema1)
               obj.text.click().then(function(){
                browser.sleep(2000);
               });
              
           
               expect(obj.r14.getText()).toBe(data.r14);
               obj.r14.getText().then(function(text){
                 console.log(text);
                 browser.sleep(2000);
         
            });
          
    },200000);	


});

using(d.Datadrivenvalidation, function (data, description) {
    it("Login page validations", function() {
  
           
      browser.refresh();
   

    obj.password.sendKeys(data.password1);
    browser.sleep(2000);

      obj.password.clear().then(function(){
        browser.sleep(2000);
    });
    obj.email.sendKeys(data.email2);


      obj.login.click().then(function(){
        browser.sleep(2000);
        
      });
     
      
      expect(obj.r2.getText()).toBe(data.r2);
      obj.r2.getText().then(function(text){
        console.log(text);
        browser.sleep(1000);
    
    });
     
  
   },200000);

   
//test1 - Invalid Email address

  it("Login page validations", function() {

      obj.email.clear().then(function(){
        browser.sleep(2000);
    });


    obj.email.sendKeys(data.email1);
    obj.password.sendKeys(data.password1);
 
      browser.sleep(1000);
      
    expect(obj.r1.getText()).toBe(data.r1);
    obj.r1.getText().then(function(text){
      console.log(text);
      browser.sleep(1000);
  
  });
   
  },200000);	
    it("Login page validations", function() {
    
        obj.email.clear().then(function(){
            browser.sleep(2000);
        });

      obj.email.sendKeys(data.email3);
      obj.password.clear().then(function(){
        browser.sleep(2000);
    });
	  obj.password.sendKeys(data.password3);
	  
 
      obj.login.click().then(function(){
		browser.sleep(1000);
		
 });
      


      expect(obj.r3.getText()).toBe(data.r3);
      obj.r3.getText().then(function(text){
        console.log(text);
		browser.sleep(1000);
		


   });
     
    },200000);	



    it("Login page validations", function() {
     
        browser.sleep(4000);

        obj.email.clear().then(function(){
            browser.sleep(2000);
        });

      obj.email.sendKeys(data.email4);
      obj.password.clear().then(function(){
        browser.sleep(2000);
    });
	  obj.password.sendKeys(data.password4);
	  
 
      obj.login.click().then(function(){
		browser.sleep(2000);
		
 });
      

      expect(obj.r4.getText()).toBe(data.r4);
      obj.r4.getText().then(function(text){
        console.log(text);
        browser.sleep(1000);

   });
     
    },200000);	
   });

 

using(d.Datadrivennewcard, function (data, description) {

  it("Messages section validation", function() {
      var EC = protractor.ExpectedConditions;


     
browser.refresh();

      browser.sleep(4000);
	  obj.email.sendKeys(data.email1);
	  obj.password.sendKeys(data.password1);
	obj.login.click().then(function(){
	  

	  browser.sleep(25000);

	});
	

    obj.cancel.click().then(function(){
        browser.sleep(4000);
      
        });
      
      obj.messages.click().then(function(){
        browser.sleep(4000);
      }); 

     
      obj.deleteicon.click().then(function(){
        browser.sleep(5000);
      }); 

expect(obj.warningmessage.getText()).toBe(data.warningmessage)
    obj.warningmessage.getText().then(function(text){
    console.log(text);
    browser.sleep(8000);
    });

    obj.ok.click().then(function(){
      browser.sleep(5000);
    }); 

  },200000);
});

using(d.Datadrivennewcard, function (data, description) {

  it("Notifiactions section validations" , function() {
      var EC = protractor.ExpectedConditions;


  

      obj.notification.click().then(function(){
        browser.sleep(5000);
      }); 
  
      obj.mealtoggle.click().then(function(){
        browser.sleep(9000);
        });
        
            obj.fundamo.click().then(function(){
             browser.sleep(5000);
              });
              obj.fundamoselect.click().then(function(){
                browser.sleep(5000);
                 });

                 obj.messages.click().then(function(){
                  browser.sleep(10000);
                   });

                   obj.warningpopup.click().then(function(){
                    browser.sleep(3000);
                     });
    
                     obj.cancelbutton.click().then(function(){
                      browser.sleep(8000);
                       });
      
                       obj.updatebutton.click().then(function(){
                        browser.sleep(5000);
                         });

                      },200000);
                    });

     /* using(d.Datadrivenw, function (data, description) {
      it('TS-'+description, function() {
                    
                    
           obj.profile.click().then(function(){
                                      browser.sleep(5000);
                               
           });
                      obj.emailt.clear();
                    
            

                      obj.firstnm.clear();
                      browser.sleep(5000);

                      obj.lastnm.clear();
                      obj.address1.clear();
                      obj.postalcode.clear();
                      obj.city.clear();

                      obj.emailt.sendKeys(data.email)
                      obj.emailt.clear();

                       obj.firstnm.sendKeys(data.firstnm);
                      expect(obj.r22.getText()).toBe(data.r22);
                      obj.r22.getText().then(function(text){
                      console.log(text);
                      browser.sleep(1000);
                    
                     }); 
                    
                      
                     
                        expect(obj.r6.getText()).toBe(data.r6);
                          obj.r6.getText().then(function(text){
                          console.log(text);
                          browser.sleep(1000);
                        
                         }); 
                 
                        expect(obj.r7.getText()).toBe(data.r7);
                        obj.r7.getText().then(function(text){
                        console.log(text);
                        browser.sleep(1000);
                      
                       }); 
                      
                    
                        expect(obj.r8.getText()).toBe(data.r8);
                        obj.r8.getText().then(function(text){
                        console.log(text);
                        browser.sleep(1000);
                      
                       }); 
                      
                        
                        expect(obj.r9.getText()).toBe(data.r9);
                        obj.r9.getText().then(function(text){
                        console.log(text);
                        browser.sleep(1000);
                      
                       }); 
                      
                                     
                      expect(obj.r10.getText()).toBe(data.r10);
                      obj.r10.getText().then(function(text){
                      console.log(text);
                      browser.sleep(1000);
                    
                     }); 
                     obj.emailt.sendKeys(data.emailte);
                     expect(obj.r23.getText()).toBe(data.r23);
                     obj.r23.getText().then(function(text){
                     console.log(text);
                     browser.sleep(1000);
                    
                    }); 
                    
                    obj.emailt.clear();
                    
                    obj.emailt.sendKeys(data.emailte);
                                     obj.lastnm.sendKeys(data.lastnm);
                    
                                   
                                      obj.pinc.sendKeys(data.pinc);
                                      browser.sleep(5000);
                               
                    
                                      obj.address1.sendKeys(data.address1);
                    
                                obj.postalcode.sendKeys(data.postalcode);
                      obj.postalcode.clear();
                      
                                      obj.postalcode.sendKeys(data.postalcode1);
                    
                                      obj.city.sendKeys(data.city);
                    
                    
                    
                       obj.update.click().then(function(){
                          browser.sleep(5000);
                          
                          });
                        expect(obj.successmessage.getText()).toBe(data.respr);
                        obj.successmessage.getText().then(function(text){
                        console.log(text);
                        browser.sleep(9000);
                        
                        });
                      
                    
                      },200000);
                    });
                    */

                  using(d.Datadrivena, function (data, description) {
                      it("Secure account page validations", function() {
                            
                      obj.secure.click().then(function(){
                        browser.sleep(6000);
                        }); 
                      
                      obj.qa1.click().then(function(){
                        browser.sleep(1000);
                        });	
                    
                    obj.selectqa1.click().then(function(){
                      console.log("Secure account is empty");
                          browser.sleep(1000);
                        });	
                    
                    
                    
                        obj.ans1.click().then(function(){
                          browser.sleep(1000);
                        });
                        
                        
                        obj.qa2.click().then(function(){
                          browser.sleep(5000);
                          });	
                    
                          $('body').click();

                          expect(obj.answerrequired.getText()).toBe(data.answerrequired);
                          obj.answerrequired.getText().then(function(text){
                          console.log(text);
                          browser.sleep(9000);
                          
                          });
                    
                          obj.ans1.sendKeys(data.ans1).then(function(){
                            browser.sleep(4000);
                          });
                          
                    
                          expect(obj.r20.getText()).toBe(data.r20);
                          obj.r20.getText().then(function(text){
                          console.log(text);
                          browser.sleep(1000);
                        
                         }); 
                        
                         
                      obj.qa2.click().then(function(){
                        browser.sleep(1000);
                        });	
                      
                      
                    obj.selectqa2.click().then(function(){
                      browser.sleep(1000);
                       });	
                      
                      obj.ans2.sendKeys(data.ans4).then(function(){
                        browser.sleep(1000);
                      });
                      
                      obj.qa3.click().then(function(){
                        browser.sleep(1000);
                        });	
                    
                      obj.selectqa3.click().then(function(){
                      browser.sleep(1000);
                       });	
                      
                    
                      obj.ans3.sendKeys(data.ans3).then(function(){
                        browser.sleep(1000);
                      });
                      
                      obj.update.click().then(function(){
                        browser.sleep(2000);
                         });	
                      
                         expect(obj.r21.getText()).toBe(data.r21);
                         obj.r21.getText().then(function(text){
                         console.log(text);
                         browser.sleep(8000);
                       
                        }); 
                    
                        
                      },200000);
                    });
                    
        
         //test2 - add student 

 using(d.Datadrivenb, function (data, description) {
	it("Add student page validations", function() {
        var EC = protractor.ExpectedConditions;

      
        browser.sleep(8000);

 

	obj.student.click().then(function(){
	browser.sleep(4000);
  
	});
  
	obj.addstudent.click().then(function(){
	browser.sleep(4000);
  
	});
  
	
	
    obj.studentid.click();
    
    obj.fname.click();
    browser.sleep(2000);
    expect(obj.r15.getText()).toBe(data.r15);
	obj.r15.getText().then(function(text){
	  console.log(text);
	  browser.sleep(1000);
  
  });
  

    obj.lname.click();
    browser.sleep(2000);

    expect(obj.r17.getText()).toBe(data.r17);
    obj.r17.getText().then(function(text){
      console.log(text);
      browser.sleep(1000);
  
  });
  obj.fname.click();
  browser.sleep(2000);

  expect(obj.r18.getText()).toBe(data.r18);
	obj.r18.getText().then(function(text){
	  console.log(text);
	  browser.sleep(1000);
  
  });
	obj.relation.click().then(function(){
        browser.sleep(4000);


	});
  
  $('body').click();


	expect(obj.r19.getText()).toBe(data.r19);
	obj.r19.getText().then(function(text){
	  console.log(text);
	  browser.sleep(1000);
  
  });
  
  obj.studentid.sendKeys(data.studentid);
  browser.sleep(2000);

  obj.fname.sendKeys(data.fname);
  browser.sleep(2000);

  obj.lname.sendKeys(data.lname);
  browser.sleep(2000);

  obj.relation.click().then(function(){
  browser.sleep(1000);
  });
  obj.relationselect.click().then(function(){
  browser.sleep(1000);
  });
 

	obj.studentbutton.click().then(function(){
	browser.sleep(5000);
	});
   
	expect(obj.r16.getText()).toBe(data.r16);
	obj.r16.getText().then(function(text){
	  console.log(text);
	  browser.sleep(8000);
  
  });

  
 

    },200000);

});
      
//payment methods



  using(d.Datadrivenc, function (data, description) {
  

      it("Payment method page validations" , function() {
          var EC = protractor.ExpectedConditions;

          browser.refresh();
            
          browser.sleep(4000);

          obj.paymentmethod.click().then(function(){
            browser.sleep(8000);
        
        });
          obj.addpayment.click().then(function(){
            browser.sleep(8000);
  
        });
    
        obj.paymentdropdown.click().then(function(){
            browser.sleep(8000);
  
        });
  
        $('body').sendKeys(protractor.Key.ESCAPE);
  
        expect(obj.error11.getText()).toBe(data.RT00163); 
        obj.error11.getText().then(function(text){
            console.log(text);
            browser.sleep(4000);
      
      });  
  
      obj.paymentdropdown.click().then(function(){
        browser.sleep(8000);

    });
       obj.paymentselection.click().then(function(){
        browser.sleep(8000);
  
       });
  
   
        obj.nickname.click().then(function(){
            browser.sleep(8000);
  
        });
        obj.cardnumber.sendKeys(data.number).then(function(){
            browser.sleep(8000);
  
        });
        expect(obj.error4.getText()).toBe(data.RT00160); 
        obj.error4.getText().then(function(text){
            console.log(text);
            browser.sleep(1000);
      
      });  
  
        obj.expirydate.sendKeys(data.month).then(function(){
            browser.sleep(8000);
  
        });
        expect(obj.error1.getText()).toBe(data.RT00155);   
        obj.error1.getText().then(function(text){
            console.log(text);
            browser.sleep(1000);
      
      });
  
        obj.cvv.sendKeys(data.cvv).then(function(){
            browser.sleep(8000);
  
        });
        expect(obj.error2.getText()).toBe(data.RT00156); 
        obj.error2.getText().then(function(text){
            console.log(text);
            browser.sleep(1000);
      
      });
  
        obj.expirydate.click().then(function(){
            browser.sleep(8000);
  
        });
        expect(obj.error9.getText()).toBe(data.RT00166);   
        obj.error9.getText().then(function(text){
            console.log(text);
            browser.sleep(1000);
      
      });
        obj.cardnumber.clear().then(function(){
            browser.sleep(5000);
        });
  
        obj.cardnumber.sendKeys(data.number1).then(function(){
            browser.sleep(8000);
                  
                  });
  
                  obj.cvv.sendKeys(data.cvv1).then(function(){
                    browser.sleep(8000);
          
                          });
                          expect(obj.error3.getText()).toBe(data.RT00157);
                          obj.error3.getText().then(function(text){
                            console.log(text);
                            browser.sleep(1000);
                      
                      });
                          obj.expirydate.click().then(function(){
                            browser.sleep(8000);
                  
                         });
                           
               expect(obj.error5.getText()).toBe(data.RT00158);
               obj.error5.getText().then(function(text){
                console.log(text);
                browser.sleep(1000);
          
          });
    
              

          obj.paymentdropdown.click().then(function(){
                  browser.sleep(8000);
        
                        });
                        obj.paymentselection.click().then(function(){
                              browser.sleep(8000);

                });
                obj.nickname.sendKeys(data.name).then(function(){
                              browser.sleep(8000);

                });
                
                obj.cardnumber.clear();

                  obj.cardnumber.sendKeys(data.number2).then(function(){
                        browser.sleep(4000);
              
            });
           
            obj.expirydate.clear();

            obj.expirydate.sendKeys(data.month1).then(function(){
                  browser.sleep(8000);
        
               });
               obj.cvv.click().then(function(){
                  browser.sleep(8000);
        
                        });
                        obj.expirydate.click().then(function(){
                          browser.sleep(8000);
                
                                });
      

                  expect(obj.error6.getText()).toBe(data.RT00165);   
                  obj.error6.getText().then(function(text){
                      console.log(text);
                      browser.sleep(4000);
                
                });

            obj.cvv.sendKeys(data.cvv2).then(function(){
                  browser.sleep(8000);
        
                        });
                        browser.executeScript('window.scrollTo(0,10000);').then(function () {

                        obj.checkbox1.click().then(function(){
                              browser.sleep(2000);
                    
                         });
                      });
                        obj.checkbox2.click().then(function(){
                              browser.sleep(2000);
                                
                             });
                        obj.addpaymentbutton.click().then(function(){
                             browser.sleep(2000);
                                            
                           });
                
                           
               expect(obj.error10.getText()).toBe(data.RT00159);   
               obj.error10.getText().then(function(text){
                  console.log(text);
                  browser.sleep(8000);
            
            });

      obj.paymentdropdown1.click().then(function(){
              browser.sleep(8000);
    
                    });
                    obj.paymentselection1.click().then(function(){
              browser.sleep(8000);
    
                    });
                    obj.nickname.sendKeys(data.name).then(function(){
                        browser.sleep(8000);
                  
                  });
                    obj.Accounttypedropdown1.click().then(function(){
                         browser.sleep(8000);

                     });

                       $('body').sendKeys(protractor.Key.ESCAPE);
                        expect(obj.error12.getText()).toBe(data.RT00161);
                        obj.error12.getText().then(function(text){
                          console.log(text);
                          browser.sleep(1000);
                    
                    }); 
                    obj.Accounttypedropdown1.click().then(function(){
                      browser.sleep(8000);

                  });              
                       obj.Accounttype1.click().then(function(){
                                      browser.sleep(8000);
                        });
           
                        obj.Accountnumber1.click().then(function(){
                                 browser.sleep(8000);
           
                            });
                                                                
                            obj.routingnumber1.click().then(function(){
                              browser.sleep(8000);
                                    
                                    });
                        
                             obj.Accountnumber1.click().then(function(){
                                            browser.sleep(8000);
                                                  
                                                  });
                            expect(obj.error8.getText()).toBe(data.RT00168); 
                            obj.error8.getText().then(function(text){
                              console.log(text);
                              browser.sleep(1000);
                        
                        });
                         obj.routingnumber1.click().then(function(){
                                                      browser.sleep(8000);
                                                            
                                                            });

                   expect(obj.error7.getText()).toBe(data.RT00167);   
                   obj.error7.getText().then(function(text){
                      console.log(text);
                      browser.sleep(1000);
                
                });

                   obj.Accountnumber1.sendKeys(data.number2).then(function(){
                        browser.sleep(8000);
                                          
                        });
                        obj.routingnumber1.sendKeys(data.routing).then(function(){
                              browser.sleep(8000);
                                                
                              });
                              obj.checkbox3.click().then(function(){
                                    browser.sleep(8000);
             
                              });
                              obj.checkbox2.click().then(function(){
                                    browser.sleep(8000);
             
                              });
                              obj.addpaymentbutton.click().then(function(){
                                    browser.sleep(8000);
             
                              }); 
                    
                    
                    expect(obj.error13.getText()).toBe(data.RT00162);   
                    obj.error13.getText().then(function(text){
                      console.log(text);
                      browser.sleep(1000);
                
                });

              },250000);


                  });


/*
                 
            using(d.Datadrivenc, function (data, description) {
              it("Should add and remove the payment methods successfully", function() {
            
               
                  var EC = protractor.ExpectedConditions;
          
                  browser.refresh();

           
                    
                    var i;
                    for(i=0;i<6;i++){
          
                      obj.paymentdropdown1.click().then(function(){
                      browser.sleep(4000);
                      });
                    
                      obj.paymentselection.click().then(function(){
                      browser.sleep(4000);
                      });
                    
                      obj.nickname.sendKeys(data.nickname).then(function(){
                      browser.sleep(1000);
                      });
                    
                      obj.cardnumber.sendKeys(data.cardnumber).then(function(){
                      browser.sleep(1000);
                      });
                    
                      obj.expirydate.sendKeys(data.expirydate).then(function(){
                      browser.sleep(1000);
                      });
                    
                      obj.cvv.sendKeys(data.cvvnum).then(function(){
                      browser.sleep(1000);
                      });
                    
                      obj.checkbox1.click().then(function(){
                      browser.sleep(1000);
                      });
                    
                      obj.checkbox2.click().then(function(){
                      browser.sleep(1000);
                      });
                    
                      obj.addpaymentbutton.click().then(function(){
                      browser.sleep(5000);
                      });
                    
                      if(i<5){
                      expect(obj.paymentmethodsuccess.getText()).toBe(data.paymentmethodsuccess);
                    obj.paymentmethodsuccess.getText().then(function(text){
                      console.log(text);
                    browser.sleep(5000);
                    });
                  
                  }
          
                  else{
          
                    expect(obj.maxlimit.getText()).toContain(data.maxlimit);
                    obj.maxlimit.getText().then(function(text){
                      console.log(text);
                      browser.sleep(5000);
                    });
               
                }
          
          
                  }
          
                 
               
                      },200000);
                  });
             */
                    
});