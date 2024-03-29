import * as React from 'react'
import classnames from 'classnames'
import { SkedFormChildren,PopOut, Datepicker, Button, FormElementWrapper, AsyncSearchSelect, SearchSelect } from '@skedulo/sked-ui'
import WrappedFormInput from '../../../commons/components/WrappedFormInput'
import { DATE_FORMAT } from '../../../commons/constants'
import {
  fetchTemplates,
  fetchGenericOptions,
} from '../../../Services/DataServices'
import { IProjectDetail, IGenericSelectItem } from '../../../commons/types'
import { AppContext } from '../../../App'
import { isEmpty } from 'lodash'

interface IProjectFormChildrenProps {
  formParams: SkedFormChildren<IProjectDetail>
  onCancel?: () => void
  project?: IProjectDetail
}

const ProjectFormChildren: React.FC<IProjectFormChildrenProps> = ({
  formParams,
  onCancel,
  project
}) => {
  const appContext = React.useContext(AppContext)
  const { objPermissions, jobRequestors } = React.useMemo(() => appContext?.config || {}, [appContext])
  const isUpdate = React.useMemo(() => !!project?.id, [project?.id])
  const { fields, isFormReadonly, resetFieldsToInitialValues, customFieldUpdate, errors, submitted } = formParams
  const shouldReadonly = isUpdate && project?.canEdit === false ? true : isFormReadonly

  const jobRequestorOptions = React.useMemo(() => {
    return jobRequestors?.map(item => ({ value: item.id, label: item.name })) || []
  }, [jobRequestors])

  const [selectedOption, setSelectedOption] = React.useState<IGenericSelectItem | null>(null)

  const handleCancel = React.useCallback(() => {
    if (typeof onCancel === 'function') {
      onCancel()
    }
    resetFieldsToInitialValues()
  }, [onCancel])

  const handleFetchTemplate = React.useCallback(
    (searchTerm: string) => {
      return fetchTemplates(searchTerm, project ? [project.id] : undefined)
    },
    [project]
  )
  const filterEndDateTrigger = React.useCallback(() => {
    // if (!filterParams.endDate) {
    //   return <></>
    // }
    return (
      <div className="cx-leading-normal cx-flex cx-h-8 cx-max-w-xs cx-rounded cx-items-center cx-mx-2 sk-cursor-pointer sk-px-3 sk-text-neutral-750 hover:sk-bg-blue-100 sk-bg-neutral-200">
        <span>
          End date:
          <span className="cx-font-semibold cx-ml-2">344444</span>
        </span>
      </div>
    )
  }, ['3333'])
  const handleFetchAccounts = React.useCallback(
    (searchTerm: string) => {
      return fetchGenericOptions({
        name: searchTerm,
        sObjectType: 'Account',
        regionIds: fields.region.id
      })
    },
    [fields.region]
  )

  const handleFetchContacts = React.useCallback(
    (searchTerm: string) => {
      return fetchGenericOptions({
        name: searchTerm,
        sObjectType: 'Contact',
        accountIds: fields.account.id,
        regionIds: fields.region.id,
      })
    },
    [fields.account, fields.region]
  )

  const handleFetchRegions = React.useCallback(
    (searchTerm: string) => {
      return fetchGenericOptions({
        name: searchTerm,
        sObjectType: 'sked__Region__c',
        accountIds: fields.account.id
      })
    },
    [fields.account]
  )

  const handleFetchLocations = React.useCallback(
    (searchTerm: string) => {
      return fetchGenericOptions({
        name: searchTerm,
        sObjectType: 'sked__Location__c',
        accountIds: fields.account.id,
        regionIds: fields.region.id,
      })
    },
    [fields.region, fields.account]
  )

  const onSelectLookupField = React.useCallback(
    (fieldName: string) => (selectedItem: IGenericSelectItem) => {
      if (selectedItem) {
        customFieldUpdate(fieldName)({ ...selectedItem, id: selectedItem.value, name: selectedItem.label })
      } else {
        customFieldUpdate(fieldName)(null)
      }
      setSelectedOption({ ...selectedItem, fieldName })
    },
    [customFieldUpdate, fields]
  )

  const onSelectJobRequestor = React.useCallback((selectedItem: IGenericSelectItem) => {
    customFieldUpdate('jobRequestor')(selectedItem?.value || '')
    },
    [customFieldUpdate]
  )
  // const onSelectDate = React.useCallback(
  //   (fieldName: string, callback?: () => void) => (value: Date) => {
  //     if (fieldName === 'startDate') {
  //       const endDate = isValid(filterDates.endDate) ? filterDates.endDate : add(value, { days: 7 })
  //       setFilterDates(prev => ({ ...prev, [fieldName]: value, endDate }))
  //       onFilterChange({
  //         [fieldName]: format(value, DATE_FORMAT),
  //         endDate: format(endDate, DATE_FORMAT),
  //       })
  //     }
  //     if (fieldName === 'endDate') {
  //       setFilterDates(prev => ({ ...prev, [fieldName]: value }))
  //       onFilterChange({ [fieldName]: format(value, DATE_FORMAT) })
  //     }
  //     if (selectedFilterSet) {
  //       setSelectedFilterSet(null)
  //     }
  //     if (typeof callback === 'function') {
  //       callback()
  //     }
  //   },
  //   [filterDates.endDate]
  // )

  React.useEffect(() => {
    if (selectedOption?.account && selectedOption?.account !== fields.account && !fields.account) {
      customFieldUpdate('account')(selectedOption?.account)
    }
    if (selectedOption?.region && selectedOption?.region !== fields.region && !fields.region) {
      customFieldUpdate('region')(selectedOption?.region)
    }

    if (selectedOption?.fieldName === 'account' && fields.contact?.id) {
      customFieldUpdate('contact')(null)
    }
    if (selectedOption?.fieldName === 'account' &&
      fields.location?.account?.id &&
      fields.location?.account?.id !== selectedOption?.value
    ) {
      customFieldUpdate('location')(null)
    }
    if (selectedOption?.fieldName === 'region' &&
      fields.location?.region?.id &&
      fields.location?.region?.id !== selectedOption?.value
    ) {
      customFieldUpdate('location')(null)
    }
  }, [selectedOption, fields.account, fields.location, fields.contact, fields.region])

  return (
    <>
      <div
        className={classnames('vertical-panel cx-p-4', {
          'custom-input-readonly': isUpdate && project?.canEdit === false,
        })}
      >
        {isUpdate && <h1 className="cx-text-base cx-mb-4 cx-font-medium">Information</h1>}
        <div className="cx-mb-4 click-to-edit-custom">
          <span className="cx-block cx-mb-1 cx-text-neutral-650 cx-leading-relaxed">Template</span>
          <FormElementWrapper
            name="templateId"
            validation={{ isValid: submitted ? !errors.templateId : true, error: submitted ? errors.templateId : '' }}
            readOnlyValue={project?.template?.name || ''}
            isReadOnly={shouldReadonly}
          >
            <AsyncSearchSelect
              name="template"
              fetchItems={handleFetchTemplate}
              debounceTime={300}
              onSelectedItemChange={onSelectLookupField('template')}
              initialSelectedItem={
                project?.template ? { value: project.template.id, label: project.template.name } : undefined
              }
              useCache={true}
              placeholder="Search template..."
              icon="chevronDown"
            />
          </FormElementWrapper>
        </div>
        <WrappedFormInput
          name="projectName"
          className="click-to-edit-custom"
          isReadOnly={shouldReadonly}
          label="Name"
          value={fields.projectName}
          error={submitted ? errors.projectName : ''}
          isRequired={true}
          maxLength={80}
        />
        <WrappedFormInput
          name="projectDescription"
          className="click-to-edit-custom"
          type="textarea"
          rows={3}
          isReadOnly={shouldReadonly}
          label="Description"
          value={fields.projectDescription}
          error={submitted ? errors.projectDescription : ''}
          maxLength={255}
          isRequired={false}
        />
        <div className="cx-mb-4 ">
          <WrappedFormInput
            name="isTemplate"
            className="click-to-edit-custom"
            type="checkbox"
            isReadOnly={shouldReadonly}
            label="Is Template"
            value={fields.isTemplate}
            isRequired={false}
          />
        </div>
        <WrappedFormInput
          className="click-to-edit-custom"
          name="projectCode"
          isReadOnly={shouldReadonly}
          label="Project Code"
          value={fields.projectCode}
          isRequired={false}
          maxLength={80}
        />
        {/* <div className="cx-flex cx-items-center">
            <PopOut
              placement="bottom"
              closeOnOuterClick={true}
              closeOnScroll={true}
              trigger={filterEndDateTrigger}
            >
              {togglePopout => (
                <Datepicker
                  selected={fields.endDate}
                  onChange={() => {}}
                  dateFormat={DATE_FORMAT}
                  inline={true}
                />
              )}
            </PopOut>
          </div> */}
        {isUpdate && (
          <>
            <div className="cx-mb-4 click-to-edit-custom cx-w-2/4">
              <span className="cx-block cx-mb-1 cx-text-neutral-650 cx-leading-relaxed">Start date</span>
              <div className="cx-flex cx-items-center hover:cx-bg-neutral-300 cx-pl-2 cx-pr-4 cx-text-neutral-600">
                <span>{project?.startDate ? `${project?.startDate}` : 'No start date'}</span>
                <span className="cx-ml-1">
                  {project?.startTime && project?.startTime ? ` - ${project?.startTime}` : ''}
                </span>
              </div>
            </div>
            <div className="cx-mb-4 click-to-edit-custom cx-w-2/4">
              <span className="cx-block cx-mb-1 cx-text-neutral-650 cx-leading-relaxed">End date</span>
              <div className="cx-flex cx-items-center hover:cx-bg-neutral-300 cx-pl-2 cx-pr-4 cx-text-neutral-600">
                <span>{project?.endDate ? `${project?.endDate}` : 'No end date'}</span>
                <span className="cx-ml-1">{project?.endDate && project?.endTime ? `- ${project?.endTime}` : ''}</span>
              </div>
            </div>
          </>
        )}
        {isUpdate && <h1 className="cx-text-base cx-mb-4 cx-font-medium">Account & Location</h1>}
        <div className="cx-flex ">
          <div className="cx-mb-4 cx-w-2/4 click-to-edit-custom">
            <span className="cx-block cx-mb-1 cx-text-neutral-650 cx-leading-relaxed">Account</span>
            <FormElementWrapper
              name="accountId"
              validation={{ isValid: submitted ? !errors.account : true, error: errors.account }}
              readOnlyValue={project?.account?.name || ''}
              isReadOnly={shouldReadonly}
            >
              <AsyncSearchSelect
                name="accountId"
                fetchItems={handleFetchAccounts}
                debounceTime={300}
                selectedItem={fields.account?.id ? { value: fields.account.id, label: fields.account.name } : undefined}
                onSelectedItemChange={onSelectLookupField('account')}
                // initialSelectedItem={
                //   project?.account ? { value: project.account.id, label: project.account.name } : undefined
                // }
                useCache={true}
                placeholder="Search accounts..."
                icon="chevronDown"
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-2/4 cx-ml-4">
            <WrappedFormInput
              name="applyAccountForAllJob"
              className="click-to-edit-custom"
              type="checkbox"
              isReadOnly={false}
              disabled={shouldReadonly}
              label="Apply to all jobs"
              value={fields.applyAccountForAllJob}
              error={submitted ? errors.applyAccountForAllJob : ''}
              isRequired={false}
            />
          </div>
        </div>
        <div className="cx-flex ">
          <div className="cx-mb-4 cx-w-2/4 click-to-edit-custom">
            <span className="cx-block cx-mb-1 cx-text-neutral-650 cx-leading-relaxed">Contact</span>
            <FormElementWrapper
              name="contactId"
              validation={{ isValid: submitted ? !errors.contactId : true, error: errors.contactId }}
              readOnlyValue={project?.contact?.name || ''}
              isReadOnly={shouldReadonly}
            >
              <AsyncSearchSelect
                name="contactId"
                fetchItems={handleFetchContacts}
                debounceTime={300}
                key={`${fields.account?.id}${fields.contact?.id}`}
                onSelectedItemChange={onSelectLookupField('contact')}
                selectedItem={fields.contact?.id ? { value: fields.contact.id, label: fields.contact.name } : undefined}
                useCache={false}
                placeholder="Search contacts..."
                icon="chevronDown"
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-2/4 cx-ml-4">
            <WrappedFormInput
              name="applyContactForAllJob"
              className="click-to-edit-custom"
              type="checkbox"
              isReadOnly={false}
              disabled={shouldReadonly}
              label="Apply to all jobs"
              value={fields.applyContactForAllJob}
              error={submitted ? errors.applyContactForAllJob : ''}
              isRequired={false}
            />
          </div>
        </div>
        <div className="cx-flex ">
          <div className="cx-mb-4 cx-w-2/4 click-to-edit-custom">
            <span className="cx-block cx-mb-1 cx-text-neutral-650 cx-leading-relaxed">
              Region
              <span className="cx-text-red-600"> *</span>
            </span>
            <FormElementWrapper
              name="regionId"
              validation={{ isValid: submitted ? !errors.region : true, error: errors.region }}
              readOnlyValue={project?.region?.name || ''}
              isReadOnly={shouldReadonly}
            >
              <AsyncSearchSelect
                name="regionId"
                fetchItems={handleFetchRegions}
                debounceTime={300}
                onSelectedItemChange={onSelectLookupField('region')}
                selectedItem={fields.region?.id ? { value: fields.region.id, label: fields.region.name } : undefined}
                useCache={true}
                placeholder="Search regions..."
                icon="chevronDown"
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-2/4 cx-ml-4">
            <WrappedFormInput
              name="applyRegionForAllJob"
              className="click-to-edit-custom"
              type="checkbox"
              isReadOnly={false}
              disabled={shouldReadonly}
              label="Apply to all jobs"
              value={fields.applyRegionForAllJob}
              error={submitted ? errors.applyRegionForAllJob : ''}
              isRequired={false}
            />
          </div>
        </div>
        <div className="cx-flex">
          <div className="cx-mb-4 cx-w-2/4 click-to-edit-custom">
            <span className="cx-block cx-mb-1 cx-text-neutral-650 cx-leading-relaxed">Location</span>
            <FormElementWrapper
              name="locationId"
              validation={{ isValid: submitted ? !errors.locationId : true, error: errors.locationId }}
              readOnlyValue={project?.location?.name || ''}
              isReadOnly={shouldReadonly}
            >
              <AsyncSearchSelect
                name="locationId"
                fetchItems={handleFetchLocations}
                key={`${fields.account?.id}${fields.region?.id}${fields.location?.id}`}
                debounceTime={300}
                onSelectedItemChange={onSelectLookupField('location')}
                selectedItem={fields.location?.id
                  ? { value: fields.location.id, label: fields.location.name }
                  : undefined
                }
                useCache={false}
                placeholder="Search locations..."
                icon="chevronDown"
              />
            </FormElementWrapper>
          </div>
          <div className="cx-mb-4 cx-w-2/4 cx-ml-4">
            <WrappedFormInput
              className="click-to-edit-custom"
              name="applyLocationForAllJob"
              type="checkbox"
              isReadOnly={false}
              disabled={shouldReadonly}
              label="Apply to all jobs"
              value={fields.applyLocationForAllJob}
              error={submitted ? errors.applyLocationForAllJob : ''}
              isRequired={false}
            />
          </div>
        </div>
      </div>
      {!shouldReadonly && (
        <div className="cx-flex cx-justify-end cx-p-4 border-top cx-bg-white cx-bottom-0 cx-sticky">
          <Button buttonType="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            className="cx-ml-2"
            type="submit"
            disabled={isUpdate && !objPermissions?.Project.allowUpdate}
          >
            Save
          </Button>
        </div>
      )}
    </>
  )
}

// export default React.memo(ProjectFormChildren)
export default ProjectFormChildren
