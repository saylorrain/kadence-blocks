/**
 * FluentCRM Controls
 *
 */

/* global kadence_blocks_params */

/**
 * Imports
 */
import Select from 'react-select';
import { addQueryArgs } from '@wordpress/url';
import apiFetch from '@wordpress/api-fetch';
import { KadencePanelBody } from '@kadence/components';
import { getFormFields } from '../../';

/**
 * Internal block libraries
 */
import { __ } from '@wordpress/i18n';

import {
	ToggleControl,
	Spinner,
	SelectControl,
} from '@wordpress/components';
import {
	useEffect, useMemo,
	useState,
} from '@wordpress/element';

/**
 * Build the Measure controls
 * @returns {object} Measure settings.
 */
export default function FluentCrmOptions( { settings, save, parentClientId } ) {

	const [ isActive, setIsActive ] = useState( false );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ list, setList ] = useState( false );
	const [ listTags, setListTags ] = useState( false );
	const [ tagsLoaded, setTagsLoaded ] = useState( false );
	const [ isFetching, setIsFetching ] = useState( false );
	const [ isFetchingTags, setIsFetchingTags ] = useState( false );
	const [ listsLoaded, setListsLoaded ] = useState( false );
	const [ isFetchingFields, setIsFetchingFields ] = useState( false );
	const [ listFields, setListFields ] = useState( false );
	const [ listFieldsLoaded, setListFieldsLoaded ] = useState( false );

	useEffect( () => {
		/**
		 * Confirm active.
		 */
		if ( undefined !== kadence_blocks_params.fluentCRM && kadence_blocks_params.fluentCRM ) {
			setIsActive( true );
		}
	}, [] );

	const fields = useMemo(() => getFormFields( parentClientId ), [ parentClientId ]);

	const saveFluentCRMMap = ( value, index ) => {
		const newItems = fields.map( ( item, thisIndex ) => {
			let newString = '';
			if ( index === thisIndex ) {
				newString = value;
			} else if ( undefined !== settings.map && undefined !== settings.map[ thisIndex ] ) {
				newString = settings.map[ thisIndex ];
			} else {
				newString = '';
			}

			return newString;
		} );

		save( { map: newItems } );
	};

	const getLists = () => {
		setIsFetching( true );

		apiFetch( {
			path: addQueryArgs(
				'/kb-fluentcrm/v1/get',
				{ endpoint: 'lists' },
			),
		} )
			.then( ( lists ) => {
				const theLists = [];
				lists.map( ( item ) => {
					theLists.push( { value: item.id, label: item.title } );
				} );

				setList( theLists );
				setListsLoaded( true );
				setIsFetching( false );
			} )
			.catch( () => {
				setList( [] );
				setListsLoaded( true );
				setIsFetching( false );
			} );
	};

	const getTags = () => {
		setIsFetchingTags( true );

		apiFetch( {
			path: addQueryArgs(
				'/kb-fluentcrm/v1/get',
				{ endpoint: 'tags' },
			),
		} )
			.then( ( tags ) => {
				const theLists = [];
				tags.map( ( item ) => {
					theLists.push( { value: item.id, label: item.title } );
				} );
				setListTags( theLists );
				setTagsLoaded( true );
				setIsFetchingTags( false );
			} )
			.catch( () => {
				setListTags( [] );
				setTagsLoaded( true );
				setIsFetchingTags( false );
			} );
	};

	const getFields = () => {
		setIsFetchingFields( true );

		apiFetch( {
			path: addQueryArgs(
				'/kb-fluentcrm/v1/get',
				{ endpoint: 'fields' },
			),
		} )
			.then( ( fields ) => {
				const theFields = [];
				theFields.push( { value: null, label: 'None' } );
				theFields.push( { value: 'email', label: 'Email *' } );
				fields.map( ( item, index ) => {
					if ( item.key !== 'email' ) {
						theFields.push( { value: item.key, label: item.title } );
					}
				} );

				setListFields( theFields );
				setListFieldsLoaded( true );
				setIsFetchingFields( false );
			} )
			.catch( () => {
				const theFields = [];
				theFields.push( { value: null, label: 'None' } );
				theFields.push( { value: 'email', label: 'Email *' } );

				setListFields( theFields );
				setListFieldsLoaded( true );
				setIsFetchingFields( false );
			} );
	};

	const hasList = Array.isArray( list ) && list.length;
	const hasFields = Array.isArray( listFields ) && listFields.length;
	const hasTags = Array.isArray( listTags ) && listTags.length;

	return (
		<KadencePanelBody
			title={__( 'FluentCRM Settings', 'kadence-blocks-pro' )}
			initialOpen={false}
			panelName={'kb-fluent-crm-settings'}
		>
			{ !isActive ?
				<>{__( 'FluentCRM is not setup/active.', 'kadence-blocks-pro' )}</>
			:
				<>
					{isFetching && (
						<Spinner/>
					)}
					{!isFetching && !hasList && (
						<>
							<h2 className="kt-heading-size-title">{__( 'Select List', 'kadence-blocks' )}</h2>
							{( !listsLoaded ? getLists() : '' )}
							{!Array.isArray( list ) ?
								<Spinner/> :
								__( 'No lists found.', 'kadence-blocks-pro' )}
						</>

					)}
					{!isFetching && hasList && (
						<>
							<h2 className="kb-heading-fln-list-title">{__( 'Select List', 'kadence-blocks' )}</h2>
							<Select
								value={( undefined !== settings.lists ? settings.lists : '' )}
								onChange={( value ) => {
									save( { lists: ( value ? value : [] ) } );
								}}
								id={'fln-list-selection'}
								options={list}
								isMulti={true}
								maxMenuHeight={200}
								placeholder={__( 'Select List' )}
							/>
							{!settings.lists && (
								<div style={{ height: '100px' }}></div>
							)}
							{undefined !== settings && undefined !== settings && settings.lists && settings.lists[ 0 ] && (
								<>
									{isFetchingTags && (
										<Spinner/>
									)}
									{!isFetchingTags && !hasTags && (
										<>
											<h2 className="kt-heading-size-title">{__( 'Select Tags', 'kadence-blocks' )}</h2>
											{( !tagsLoaded ? getTags() : '' )}
											{!Array.isArray( listTags ) ?
												<Spinner/> :
												__( 'No Tags found.', 'kadence-blocks-pro' )}
										</>

									)}
									{!isFetchingTags && hasTags && (
										<>
											<h2 className="kt-heading-size-title">{__( 'Select Tags', 'kadence-blocks' )}</h2>
											<Select
												value={( undefined !== settings && undefined !== settings && undefined !== settings.tags ? settings.tags : '' )}
												onChange={( value ) => {
													save( { tags: ( value ? value : [] ) } );
												}}
												id={'fln-tag-selection'}
												isClearable={true}
												options={listTags}
												isMulti={true}
												maxMenuHeight={200}
												placeholder={__( 'Select Tags' )}
											/>
										</>
									)}
									{isFetchingFields && (
										<Spinner/>
									)}
									{!isFetchingFields && !hasFields && (
										<>
											<h2 className="kt-heading-size-title">{__( 'Map Fields', 'kadence-blocks' )}</h2>
											{( !listFieldsLoaded ? getFields() : '' )}
											{!Array.isArray( listFields ) ?
												<Spinner/> :
												__( 'No Fields found.', 'kadence-blocks-pro' )}
										</>

									)}
									{!isFetchingFields && hasFields && (
										<>
											<h2 className="kt-heading-size-title">{__( 'Map Fields', 'kadence-blocks' )}</h2>
											{fields && (
												fields.map( ( item, index ) => {
													return (
														<div key={index} className="kb-field-map-item">
															<div className="kb-field-map-item-form">
																<p className="kb-field-map-item-label">{__( 'Form Field', 'kadence-blocks' )}</p>
																<p className="kb-field-map-item-name">{item.label}</p>
															</div>
															<SelectControl
																label={__( 'Select Field:' )}
																options={listFields}
																value={( undefined !== settings.map && undefined !== settings.map[ index ] && settings.map[ index ] ? settings.map[ index ] : '' )}
																onChange={( value ) => {
																	saveFluentCRMMap( value, index );
																}}
															/>
														</div>
													);
												} )
											)}
										</>
									)}
									<div style={{ height: '10px' }}></div>
									<ToggleControl
										label={__( 'Require Double Opt In?', 'kadence-blocks' )}
										checked={( undefined !== settings && undefined !== settings && undefined !== settings.doubleOptin ? settings.doubleOptin : false )}
										onChange={( value ) => save( { doubleOptin: value } )}
									/>
								</>
							)}
						</>
					)}
				</>
			}
		</KadencePanelBody>
	);

}
