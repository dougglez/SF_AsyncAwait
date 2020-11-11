/*
This is an example of using async/await in salesforce using apex methods

*/

import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getAccountList from '@salesforce/apex/PromiseChainsInLWC.getAccountList'
import getRelatedContactList from '@salesforce/apex/PromiseChainsInLWC.getRelatedContactList'
import getRelatedOpptyList from '@salesforce/apex/PromiseChainsInLWC.getRelatedOpptyList'

// #region DataTable Setup
const columns = [
    { label: 'Id', fieldName: 'accountId', type: 'text' },
    { label: 'Name', fieldName: 'name', type: 'text' },
    { label: 'Phone', fieldName: 'phone', type: 'text' }
];
const data = [];
const contactColumns = [
    { label: 'Id', fieldName: 'id', type: 'text' },
    { label: 'First', fieldName: 'first', type: 'text' },
    { label: 'Last', fieldName: 'last', type: 'text' },
    { label: 'Email', fieldName: 'email', type: 'text' }
];
const conData = [];
const oppColumns = [
    { label: 'Id', fieldName: 'id', type: 'text' },
    { label: 'Stage', fieldName: 'stage', type: 'text' },
    { label: 'Amount', fieldName: 'amount', type: 'text' },
    { label: 'Source', fieldName: 'source', type: 'text' }
];
const oppData = [];
// #endregion DataTable Setup
export default class PromiseChains extends LightningElement {
    // #region Template Variables
    isLoading = false;;
    showStart = true;
    showSubmit = false;
    foundAccounts = false;
    selectedAccount = false;
    foundContacts = false;
    foundOpptys = false;
    // #endregion Template Variables
    // #region Selected Account
    rowData;
    SelectedAccId;
    SelectedAccName;
    SelectedAccPhone;
    // #endregion Selected Account
    // #region DataTable Variables
    name;
    searchedAccounts;
    columns = columns;
    data = data;
    conColumns = contactColumns;
    conData = conData;
    oppColumns = oppColumns;
    oppData = oppData;
    // #endregion DataTable Variables
    // #region Promise Chain
    startPromiseChain() {
        this.showSubmit = false;
        this.selectedAccount = true;
        this.foundAccounts = false;
        this.isLoading = true;
        this.rowData.forEach(d => {
            this.SelectedAccId = d.accountId;
            this.SelectedAccName = d.name;
            this.SelectedAccPhone = d.phone;
        });
        // this is pormise chaining. We call the first promise, and in the .then, we return the next promise. This allows us to add another .then AFTER the original .than instead of nesting them. As long as a promise is being returned, you can continue to chain the .then's. Only one .catch is needed, as any errors will leave the promise chain and go into the .catch.
        getRelatedContactList({ id: this.SelectedAccId })
            .then((conResp) => {
                if (conResp && conResp.length > 0) {
                    this.foundContacts = true;
                    conResp.forEach((d, i) => {
                        this.conData.push({
                            id: d.Id,
                            first: d.FirstName,
                            last: d.LastName,
                            email: d.Email
                        })
                        console.log(this.conData[i]);
                    })
                }
                return getRelatedOpptyList({ id: this.SelectedAccId });
            })
            .then((oppResp) => {
                if (oppResp && oppResp.length > 0) {
                    this.foundOpptys = true;
                    oppResp.forEach((d, i) => {
                        this.oppData.push({
                            id: d.Id,
                            stage: d.StageName,
                            amount: d.Amount,
                            source: d.LeadSource
                        })
                        console.log(this.oppData[i]);
                    })
                }
                this.isLoading = false;
            })
            .catch((err) => {
                this.isLoading = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error: ' + err.message,
                        variant: 'error'
                    })
                );
            });
    }
    //#endregion Promise Chain
    // #region Async/Await
    // another way to accomplish the same thing is to use async/await. for async await, the outer function must have the async label (decorator?). This turns the outer function into a promise, and now we can use await inside of the function to tell the code when to hold and wait for a certain response to come back.
    async asyncPromiseChain() {

        this.showSubmit = false;
        this.selectedAccount = true;
        this.foundAccounts = false;
        this.isLoading = true;
        this.rowData.forEach(d => {
            this.SelectedAccId = d.accountId;
            this.SelectedAccName = d.name;
            this.SelectedAccPhone = d.phone;
        });

        let conResp = await getRelatedContactList({ id: this.SelectedAccId });
        if (conResp && conResp.length > 0) {
            conResp.forEach((d, i) => {
                this.conData.push({
                    id: d.Id,
                    first: d.FirstName,
                    last: d.LastName,
                    email: d.Email
                })
                console.log(this.conData[i]);
            })
            this.foundContacts = true;
        }
        let oppResp = await getRelatedOpptyList({ id: this.SelectedAccId });
        if (oppResp && oppResp.length > 0) {
            oppResp.forEach((d, i) => {
                this.oppData.push({
                    id: d.Id,
                    stage: d.StageName,
                    amount: '$' + d.Amount,
                    source: d.LeadSource
                })
                console.log(this.oppData[i]);
            })
            this.foundOpptys = true;
        }
        this.isLoading = oppResp != null && conResp != null;
    }
    //#endregion Async/Await
    // #region Events
    handleSearch() {
        this.isLoading = true;
        let name = this.template.querySelector(".accountSearchTerm").value;
        this.name = name;
        getAccountList({ name })
            .then(data => {
                this.showStart = false;
                this.getAccountBySearchTermSuccess(data)
                this.isLoading = false;
            })
            .catch(err => {
                console.log('err:', err);
                this.isLoading = false;
                this.foundAccounts = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error: ' + err.message,
                        variant: 'error'
                    })
                );
            });
    }

    handleSearchEnter(event) {
        if (event.key === "Enter") {
            this.handleSearch();
        }
    }

    handleInputChange() {
        this.isLoading = false;;
        this.showStart = true;
        this.showSubmit = false;
        this.foundAccounts = false;
        this.selectedAccount = false;
        this.foundContacts = false;
        this.foundOpptys = false;
    }

    handleRowSelection(e) {
        this.rowData = e.detail.selectedRows;
        this.showSubmit = this.rowData.length > 0;
    }
    //#endregion events
    // #region SuccessHandlers
    getAccountBySearchTermSuccess(resp) {
        this.searchedAccounts = resp;

        if (this.searchedAccounts.length === 0) {
            this.showStart = true;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'No Records Found',
                    message: 'No Records Found matching your search term "' + this.name + '"',
                    variant: 'info'
                })
            );
            return;
        }
        if (this.searchedAccounts) {
            this.foundAccounts = true;
            this.data = [];
            this.searchedAccounts.forEach(account => {
                this.data.push({
                    accountId: account.Id,
                    name: account.Name,
                    phone: account.Phone
                });
            })
        }
    }
    //#endregion SuccessHandlers
}