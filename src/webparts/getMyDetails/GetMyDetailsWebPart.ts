import {
  BaseClientSideWebPart,
  IPropertyPaneSettings,
  IWebPartContext,
  PropertyPaneTextField
} from '@microsoft/sp-client-preview';

import styles from './GetMyDetails.module.scss';
import * as strings from 'mystrings';
import { IGetMyDetailsWebPartProps } from './IGetMyDetailsWebPartProps';


export interface IUserDetails {
  value: string;
}

export default class GetMyDetailsWebPart extends BaseClientSideWebPart<IGetMyDetailsWebPartProps> {

  public constructor(context: IWebPartContext) {
    super(context);
  }

  public render(): void {

    this.domElement.innerHTML = `
      <div class="${styles.getMyDetails}">
        <div class="${styles.container}">
          <div class="ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.row}">
            <div class="ms-Grid-col ms-u-lg10 ms-u-xl8 ms-u-xlPush2 ms-u-lgPush1">
              <span class="ms-font-xl ms-fontColor-white">Welcome to SharePoint!</span>
              <p class="ms-font-l ms-fontColor-white">Customize SharePoint experiences using Web Parts.</p>
              <p class='ms-font-l ms-fontColor-white'>Loading from ${this.context.pageContext.web.title}</p>
              <a href="https://github.com/SharePoint/sp-dev-docs/wiki" class="ms-Button ${styles.button}">
                <span class="ms-Button-label">Learn more</span>
              </a>
            </div>
          </div>
          <div id="spListContainer" />
        </div>
      </div>`;

    this.showMyDetails();
  }

  private showMyDetails(): void{
    this._getMyData()
        .then((response) => {
          this._renderDetails(response);
        });
  }

  private _getMyData(): Promise<IUserDetails> {
    const webAbsoluteUrl: string = this.context.pageContext.web.absoluteUrl;
    const userLoginName: string = encodeURIComponent(_spClientSidePageContext.user.LoginName);
    const propertyName: string = this.properties.userprofileproperty;

    return this.context.httpClient.get(`${webAbsoluteUrl}/_api/SP.UserProfiles.PeopleManager/GetUserProfilePropertyFor(accountName=@v,propertyName='${propertyName}')?@v='${userLoginName}'`)
      .then((response: Response) => {
        return response.json();
      });
  }


  private _renderDetails(property: IUserDetails): void {

    const listContainer: Element = this.domElement.querySelector('#spListContainer');

    const userPropertyLabel: Element = document.createElement("label");
    userPropertyLabel.innerHTML = this.properties.userprofileproperty;

    const userPropertyInput: Element = document.createElement("input");
    userPropertyInput.setAttribute("type", "text");
    userPropertyInput.setAttribute("value", property.value);

    const updateButton: Element = document.createElement("button");
    updateButton.innerHTML = "Update";
    // TODO: Fix this
    updateButton.setAttribute("onclick", "GetMyDetailsWebPart.setUserProperties");

    listContainer.appendChild(userPropertyLabel);
    listContainer.appendChild(userPropertyInput);
    listContainer.appendChild(updateButton);
  }

  private setUserProperties(){
      console.log("clicked");

  }

  protected get propertyPaneSettings(): IPropertyPaneSettings {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('userprofileproperty', {
                  label: "User Profile Property"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
