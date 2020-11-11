public with sharing class PromiseChainsInLWC {
    
    @AuraEnabled
    public static List<Account> getAccountList(String name) {
        name = '%' + name + '%';
        System.debug('name: ' + name);
        return [SELECT Id, Name, Phone FROM Account WHERE Name LIKE: name LIMIT 5];
    }


    @AuraEnabled
    public static List<Contact> getRelatedContactList(String id) {
        return [SELECT Id, FirstName, LastName, EMail FROM Contact WHERE AccountId =: id];
    }

    @AuraEnabled
    public static List<Opportunity> getRelatedOpptyList(String id) {
        return [SELECT StageName, Amount, LeadSource FROM Opportunity WHERE AccountId =: id];
    }
}