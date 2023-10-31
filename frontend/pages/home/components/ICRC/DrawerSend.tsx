/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { Fragment } from "react";
import { GeneralHook } from "../../hooks/generalHook";
import { SentHook } from "../../hooks/sentHooks";
import QRscanner from "@pages/components/QRscanner";
import DialogSendConfirmation from "./DialogSendConfirmation";
import SendOwnAccount from "./SendOwnAccount";
import SendOutAccount from "./SendOutAccount";

interface DrawerSendProps {
  setDrawerOpen(value: boolean): void;
  drawerOpen: boolean;
}

const DrawerSend = ({ setDrawerOpen, drawerOpen }: DrawerSendProps) => {
  const { selectedAsset, selectedAccount: baseAccount } = GeneralHook();
  const {
    receiver,
    setReciver,
    newAccount,
    setNewAccount,
    showAccounts,
    setShowAccounts,
    amount,
    setAmount,
    newAccountErr,
    setNewAccountErr,
    modal,
    showModal,
    qrView,
    setQRview,
    setOpenContactList,
    sendingStatus,
    setSendingStatus,
    assetDropOpen,
    setAssetDropOpen,
    selectedAccount,
    setSelectedAccount,
    contacts,
    contactToSend,
    setContactToSend,
  } = SentHook(drawerOpen, baseAccount);

  return (
    <Fragment>
      {!receiver.icrcAccount.owner ? (
        qrView ? (
          <QRscanner
            setQRview={setQRview}
            qrView={qrView}
            onSuccess={(value: string) => {
              setNewAccount(value);
              setQRview(false);
              navigator.clipboard.writeText(value);
            }}
          />
        ) : (
          <SendOutAccount
            setOpenContactList={setOpenContactList}
            contacts={contacts}
            selectedAccount={selectedAccount}
            selectedAsset={selectedAsset}
            setShowAccounts={setShowAccounts}
            showAccounts={showAccounts}
            setNewAccountErr={setNewAccountErr}
            newAccountErr={newAccountErr}
            setNewAccount={setNewAccount}
            newAccount={newAccount}
            setReciver={setReciver}
            setContactToSend={setContactToSend}
            setQRview={setQRview}
          ></SendOutAccount>
        )
      ) : (
        <SendOwnAccount
          selectedAccount={selectedAccount}
          setSelectedAccount={setSelectedAccount}
          selectedAsset={selectedAsset}
          receiver={receiver}
          setReciver={setReciver}
          contactToSend={contactToSend}
          assetDropOpen={assetDropOpen}
          setAssetDropOpen={setAssetDropOpen}
          showModal={showModal}
          amount={amount}
          setDrawerOpen={setDrawerOpen}
          setSendingStatus={setSendingStatus}
          setAmount={setAmount}
          setNewAccount={setNewAccount}
          setContactToSend={setContactToSend}
        ></SendOwnAccount>
      )}
      {modal && (
        <DialogSendConfirmation
          setDrawerOpen={setDrawerOpen}
          showModal={showModal}
          modal={modal}
          receiver={receiver}
          sendingStatus={sendingStatus}
          amount={amount}
          selectedAccount={selectedAccount}
          selectedAsset={selectedAsset}
        ></DialogSendConfirmation>
      )}
    </Fragment>
  );
};

export default DrawerSend;
